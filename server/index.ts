import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import equipmentRoutes from "./routes/equipment";
import inventoryRoutes from "./routes/inventory";

const app = express();
const port = 3001;

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/equipment", equipmentRoutes);
app.use("/inventory", inventoryRoutes);

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/maintenance-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World! This is the maintenance app backend.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});