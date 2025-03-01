import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import Equipment, { IEquipment } from "./models/Equipment";

const app = express();
const port = 3001;

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/maintenance-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// GET all equipment
app.get("/equipment", async (req: Request, res: Response) => {
  try {
    const equipment: IEquipment[] = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    res.status(500).send("Error fetching equipment: " + err);
  }
});

// POST new equipment
app.post("/equipment", async (req: Request, res: Response) => {
  try {
    console.log("Received equipment:", req.body); // Debug log
    const newEquipment = new Equipment(req.body);
    const savedEquipment = await newEquipment.save();
    res.status(201).json(savedEquipment);
  } catch (err) {
    console.error("Error adding equipment:", err); // Detailed error
    res.status(400).send("Error adding equipment: " + err);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World! This is the maintenance app backend.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});