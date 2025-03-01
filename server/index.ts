import express, { Request, Response, RequestHandler } from "express";
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
const getEquipmentHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const equipment: IEquipment[] = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    res.status(500).send("Error fetching equipment: " + err);
  }
};

app.get("/equipment", getEquipmentHandler);

// POST new equipment
const postEquipmentHandler: RequestHandler<{}, any, IEquipment> = async (
  req: Request<{}, any, IEquipment>,
  res: Response
) => {
  try {
    console.log("Received equipment:", req.body);
    const { _id, name, partIds, parentId, inventoryPartIds, inventoryId } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).send("Name is required");
      return;
    }

    const newEquipment = new Equipment({
      _id: _id || `equip-${Date.now()}`, // Fallback ID if not provided
      name,
      partIds: partIds || [], // Sub-equipment IDs
      parentId,
      inventoryPartIds: inventoryPartIds || [], // Inventory part IDs
      inventoryId,
    });
    const savedEquipment = await newEquipment.save();
    res.status(201).json(savedEquipment);
  } catch (err) {
    console.error("Error adding equipment:", err);
    res.status(400).send("Error adding equipment: " + err);
  }
};

app.post("/equipment", postEquipmentHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World! This is the maintenance app backend.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});