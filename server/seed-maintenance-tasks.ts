import mongoose from "mongoose";
import MaintenanceTask, { IMaintenanceTask } from "./models/MaintenanceTask";

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/maintenance-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define seed interface matching IMaintenanceTask
interface SeedMaintenanceTask {
  _id: string;
  equipmentId: string;
  type: "Calibration" | "PM";
  schedule: Date;
  description?: string;
  completed?: boolean;
}

// Initial maintenance task data tied to equipment from seed.ts
const sampleData: SeedMaintenanceTask[] = [
  {
    _id: "task-001",
    equipmentId: "equip-001", // Pump B
    type: "Calibration",
    schedule: new Date("2025-03-15"),
    description: "Calibrate pump pressure",
  },
  {
    _id: "task-002",
    equipmentId: "equip-002", // Motor
    type: "PM",
    schedule: new Date("2025-03-20"),
    description: "Replace motor oil",
    completed: false,
  },
  {
    _id: "task-003",
    equipmentId: "equip-003", // Valve
    type: "Calibration",
    schedule: new Date("2025-04-01"),
    description: "Check valve alignment",
  },
];

async function seedMaintenanceTasks() {
  try {
    await MaintenanceTask.deleteMany({}); // Clear existing tasks
    await MaintenanceTask.insertMany(sampleData);
    console.log("Maintenance tasks seeded!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding maintenance tasks:", err);
  }
}

seedMaintenanceTasks();