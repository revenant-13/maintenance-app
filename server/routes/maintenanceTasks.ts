import express, { RequestHandler } from "express";
import MaintenanceTask from "../models/MaintenanceTask";

const router = express.Router();

const getTasksHandler: RequestHandler = async (req, res) => {
  try {
    const tasks = await MaintenanceTask.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).send("Error fetching tasks: " + err);
  }
};

const postTasksHandler: RequestHandler = async (req, res) => {
  try {
    const { equipmentId, type, schedule, description, completed } = req.body;

    if (!equipmentId || !type || !schedule) {
      res.status(400).send("Equipment ID, type, and schedule are required");
      return;
    }

    const newTask = new MaintenanceTask({
      equipmentId,
      type,
      schedule,
      description,
      completed: completed || false,
    });

    console.log("New task before save:", newTask);
    console.log("New task _id:", newTask._id); // Debug _id
    const savedTask = await newTask.save();
    console.log("Saved task:", savedTask);
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(400).send("Error adding task: " + err);
  }
};

const putTaskHandler: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTask = await MaintenanceTask.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    if (!updatedTask) {
      res.status(404).send("Task not found");
      return;
    }
    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(400).send("Error updating task: " + err);
  }
};

const deleteTaskHandler: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await MaintenanceTask.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      res.status(404).send("Task not found");
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(400).send("Error deleting task: " + err);
  }
};

router.get("/", getTasksHandler);
router.post("/", postTasksHandler);
router.put("/:id", putTaskHandler);
router.delete("/:id", deleteTaskHandler);

export default router;