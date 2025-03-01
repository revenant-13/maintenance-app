import express, { Request, Response, RequestHandler } from "express";
import Equipment, { IEquipment } from "../models/Equipment";

const router = express.Router();

// GET all equipment
const getEquipmentHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const equipment: IEquipment[] = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    res.status(500).send("Error fetching equipment: " + err);
  }
};

// POST new equipment
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

    if (partIds && partIds.length > 0) {
      await Equipment.updateMany(
        { _id: { $in: partIds } },
        { $set: { parentId: savedEquipment._id } }
      );
    }

    if (parentId) {
      await Equipment.updateOne(
        { _id: parentId },
        { $addToSet: { partIds: savedEquipment._id } }
      );
    }

    res.status(201).json(savedEquipment);
  } catch (err) {
    console.error("Error adding equipment:", err);
    res.status(400).send("Error adding equipment: " + err);
  }
};

router.get("/", getEquipmentHandler);
router.post("/", postEquipmentHandler);

export default router;