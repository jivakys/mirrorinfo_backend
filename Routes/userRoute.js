const express = require("express");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { User } = require("../Models/userModel");
const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  let { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .send({ error: "User already registered in Database" });
    }

    bcrypt.hash(password, +process.env.SALT, async function (err, hash) {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).send({ error: "Server error occurred" });
      }

      let newUser = new User({
        name,
        email,
        password: hash,
      });

      try {
        await newUser.save();
        res
          .status(200)
          .send({ message: "User registered successfully", newUser });
      } catch (saveError) {
        console.error("Error saving user:", saveError);
        res.status(500).send({ error: "Error saving user to database" });
      }
    });
  } catch (error) {
    console.error("Error in registration route:", error);
    res.status(400).send({ error: "Error processing registration request" });
  }
});

userRouter.post("/login", async (req, res) => {
  let { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      res
        .status(400)
        .send({ error: "User not found here, please register", OK: false });
    } else {
      let name = user.name;
      bcrypt.compare(password, user.password, async function (err, result) {
        if (result) {
          var token = jwt.sign({ userID: user._id }, process.env.SECRET_KEY);
          res.status(200).send({
            message: "User is Logged In",
            token,
            user,
            name: name,
            OK: true,
          });
        } else {
          res.status(401).send({
            error: "You have Inter Incorrect Credentials, Kindly Login Again",
            OK: false,
          });
        }
      });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
    console.log(error);
  }
});

module.exports = {
  userRouter,
};
