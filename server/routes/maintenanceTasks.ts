import express, { Request, Response, RequestHandler } from "express";
import MaintenanceTask, { IMaintenanceTask } from "../models/MaintenanceTask";

const router = express.Router();

// GET all maintenance tasks
const getMaintenanceTasksHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const tasks: IMaintenanceTask[] = await MaintenanceTask.find();
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

router.get("/", getMaintenanceTasksHandler);
router.post("/", postMaintenanceTaskHandler);

export default router;