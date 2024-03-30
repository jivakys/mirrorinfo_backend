const express = require("express");
const taskRouter = express.Router();
// const MongoClient = require("mongodb").MongoClient;
const { authenticate } = require("../Middlewares/authenticate");
const { TaskModel } = require("../Models/taskModel");

taskRouter.get("/dashboard", authenticate, async (req, res) => {
  try {
    const tasks = await TaskModel.find();
    res.send(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).send({ msg: "Error retrieving tasks from Mongodb" });
  }
});

taskRouter.post("/addTask", authenticate, async (req, res) => {
  const { title, description, status } = req.body;
  try {
    if (!title) return res.status(400).send("Title is required");
    const task = new TaskModel({
      title: title,
      description: description,
      status: status || "pending",
    });
    // console.log("task=", task);
    await task.save();
    res.send({ msg: "new task added", task });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
});

taskRouter.put("/update/:id", authenticate, async (req, res) => {
  try {
    const payload = req.body;
    const taskID = req.params.id;
    const newTask = await TaskModel.findByIdAndUpdate(
      taskID,
      {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    if (!newTask) return res.status(404).send("task not found");
    res.send({ msg: `The task with id: ${taskID} has been updated` });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: err.message });
  }
});

taskRouter.delete("/delete/:id", authenticate, async (req, res) => {
  try {
    const taskID = req.params.id;
    const task = await TaskModel.findByIdAndDelete({ _id: taskID });
    if (!task) return res.status(404).send("task not found");
    res.send({ msg: `Task with the ${taskID} has been deleted` });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = { taskRouter };
