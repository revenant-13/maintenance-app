import express, { Request, Response, RequestHandler } from "express";
import MaintenanceTask, { IMaintenanceTask } from "../models/MaintenanceTask";

const router = express.Router();

// GET all maintenance tasks
const getMaintenanceTasksHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { completed, start, end } = req.query;
    const filter: any = {};
    if (completed !== undefined) {
      filter.completed = completed === "true";
    }
    if (start || end) {
      filter.schedule = {};
      if (start) filter.schedule.$gte = new Date(start as string);
      if (end) filter.schedule.$lte = new Date(end as string);
    }
    const tasks: IMaintenanceTask[] = await MaintenanceTask.find(filter);
    res.json(tasks);
  } catch (err) {
    res.status(500).send("Error fetching maintenance tasks: " + err);
  }
};

// POST new maintenance task
const postMaintenanceTaskHandler: RequestHandler<{}, any, IMaintenanceTask> = async (
  req: Request<{}, any, IMaintenanceTask>,
  res: Response
) => {
  try {
    console.log("Received task:", req.body);
    const { equipmentId, type, schedule, description, completed } = req.body;

    if (!equipmentId || !type || !schedule) {
      res.status(400).send("Equipment ID, type, and schedule are required");
      return;
    }

    const newTask = new MaintenanceTask({
      _id: `task-${Date.now()}`,
      equipmentId,
      type,
      schedule,
      description,
      completed: completed || false,
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error adding maintenance task:", err);
    res.status(400).send("Error adding maintenance task: " + err);
  }
};

// PUT update maintenance task (toggle completed or edit details)
const updateMaintenanceTaskHandler: RequestHandler<{ id: string }, any, Partial<IMaintenanceTask>> = async (
  req: Request<{ id: string }, any, Partial<IMaintenanceTask>>,
  res: Response
) => {
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
    console.error("Error updating maintenance task:", err);
    res.status(400).send("Error updating maintenance task: " + err);
  }
};

router.get("/", getMaintenanceTasksHandler);
router.post("/", postMaintenanceTaskHandler);
router.put("/:id", updateMaintenanceTaskHandler);

export default router;