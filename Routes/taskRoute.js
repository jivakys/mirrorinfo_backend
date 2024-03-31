const express = require("express");
const taskRouter = express.Router();
const { authenticate } = require("../Middlewares/authenticate");
const { TaskModel } = require("../Models/taskModel");


taskRouter.get("/dashboard", authenticate, async (req, res) => {
  try {
    const tasks = await TaskModel.find({ userId: req.body.userId });
    res.send(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).send({ msg: "Error retrieving tasks from MongoDB" });
  }
});

taskRouter.post("/addTask", authenticate, async (req, res) => {
  const { title, description, status } = req.body;
  try {
    if (!title) return res.status(400).send("Title is required");
    const task = new TaskModel({
      title,
      description,
      status: status || "pending",
      userId: req.body.userId,
    });
    await task.save();
    res.send({ msg: "New task added", task });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
});

taskRouter.put("/update/:id", authenticate, async (req, res) => {
  try {
    const payload = req.body;
    const taskID = req.params.id;
    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: taskID, userId: req.body.userId },
      {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    if (!updatedTask) return res.status(404).send("Task not found");
    res.send({ msg: `The task with id: ${taskID} has been updated` });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

taskRouter.delete("/delete/:id", authenticate, async (req, res) => {
  try {
    const taskID = req.params.id;
    const deletedTask = await TaskModel.findOneAndDelete({ _id: taskID, userId: req.body.userId });
    if (!deletedTask) return res.status(404).send("Task not found");
    res.send({ msg: `Task with id ${taskID} has been deleted` });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = { taskRouter };
