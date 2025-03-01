import express, { Request, Response, RequestHandler } from "express";
import mongoose from "mongoose";
import cors from "cors";
import Equipment, { IEquipment } from "./models/Equipment";
import Inventory, { IInventory } from "./models/Inventory";

const app = express();
const port = 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/maintenance-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const getEquipmentHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const equipment: IEquipment[] = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    res.status(500).send("Error fetching equipment: " + err);
  }
};

app.get("/equipment", getEquipmentHandler);

const postEquipmentHandler: RequestHandler<{}, any, IEquipment> = async (
  req: Request<{}, any, IEquipment>,
  res: Response
) => {
  try {
    console.log("Received equipment:", req.body);
    const { _id, name, partIds, parentId, inventoryPartIds, inventoryId } = req.body;

    if (!name) {
      res.status(400).send("Name is required");
      return;
    }

    const newEquipment = new Equipment({
      _id: _id || `equip-${Date.now()}`,
      name,
      partIds: partIds || [],
      parentId,
      inventoryPartIds: inventoryPartIds || [],
      inventoryId,
    });
    const savedEquipment = await newEquipment.save();

    // Update sub-equipment parentId
    if (partIds && partIds.length > 0) {
      await Equipment.updateMany(
        { _id: { $in: partIds } },
        { $set: { parentId: savedEquipment._id } }
      );
    }

    // Update parent's partIds if parentId is set
    if (parentId) {
      await Equipment.updateOne(
        { _id: parentId },
        { $addToSet: { partIds: savedEquipment._id } } // Avoid duplicates
      );
    }

    res.status(201).json(savedEquipment);
  } catch (err) {
    console.error("Error adding equipment:", err);
    res.status(400).send("Error adding equipment: " + err);
  }
};

app.post("/equipment", postEquipmentHandler);

const getInventoryHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const inventory: IInventory[] = await Inventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).send("Error fetching inventory: " + err);
  }
};

app.get("/inventory", getInventoryHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World! This is the maintenance app backend.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});