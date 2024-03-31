const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (decoded) {
        req.body.userId = decoded.userID;
        next();
      } else {
        res.status(400).send("Please login first!");
      }
    });
  } else {
    res
      .status(401)
      .send({ Message: "Unauthorized access, Please login first!" });
  }
};

module.exports = { authenticate };
