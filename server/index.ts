import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import equipmentRoutes from "./routes/equipment";
import maintenanceTaskRoutes from "./routes/maintenancetasks";
import inventoryRoutes from "./routes/inventory";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

app.use("/equipment", equipmentRoutes);
app.use("/maintenance-tasks", maintenanceTaskRoutes);
app.use("/inventory", inventoryRoutes);

mongoose.connect("mongodb://localhost:27017/maintenance-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

app.listen(3001, () => {
  console.log("Server running at http://localhost:3001");
});