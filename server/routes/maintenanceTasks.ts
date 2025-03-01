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

router.get("/", getMaintenanceTasksHandler);

export default router;