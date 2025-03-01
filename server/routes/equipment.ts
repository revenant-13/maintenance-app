import express, { Request, Response, RequestHandler } from "express";
import Equipment, { IEquipment } from "../models/Equipment";

const router = express.Router();

const getEquipmentHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const equipment: IEquipment[] = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    res.status(500).send("Error fetching equipment: " + err);
  }
};

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

    if (partIds && partIds.length > 0) {
      if (parentId && partIds.includes(parentId)) {
        res.status(400).send("An equipment cannot be both a parent and a sub-equipment");
        return;
      }

      const subEquipment = await Equipment.find({ _id: { $in: partIds } });
      for (const sub of subEquipment) {
        if (sub.parentId && sub.parentId !== newEquipment._id) {
          await Equipment.updateOne(
            { _id: sub.parentId },
            { $pull: { partIds: sub._id } }
          );
        }
      }

      const savedEquipment = await newEquipment.save();

      await Equipment.updateMany(
        { _id: { $in: partIds } },
        { $set: { parentId: savedEquipment._id } }
      );
    } else {
      const savedEquipment = await newEquipment.save();
    }

    if (parentId) {
      await Equipment.updateOne(
        { _id: parentId },
        { $addToSet: { partIds: newEquipment._id } }
      );
    }

    const savedEquipment = await newEquipment.save(); // Note: Redundant—remove in final version

    res.status(201).json(savedEquipment);
  } catch (err) {
    console.error("Error adding equipment:", err);
    res.status(400).send("Error adding equipment: " + err);
  }
};

const updateEquipmentHandler: RequestHandler<{ id: string }, any, Partial<IEquipment>> = async (
  req: Request<{ id: string }, any, Partial<IEquipment>>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    if (!updatedEquipment) {
      res.status(404).send("Equipment not found");
      return;
    }
    res.json(updatedEquipment);
  } catch (err) {
    console.error("Error updating equipment:", err);
    res.status(400).send("Error updating equipment: " + err);
  }
};

const deleteEquipmentHandler: RequestHandler<{ id: string }> = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      res.status(404).send("Equipment not found");
      return;
    }

    // Clear parentId of sub-equipment
    if (equipment.partIds && equipment.partIds.length > 0) {
      await Equipment.updateMany(
        { _id: { $in: equipment.partIds } },
        { $set: { parentId: null } }
      );
    }

    // Remove from parent's partIds
    if (equipment.parentId) {
      await Equipment.updateOne(
        { _id: equipment.parentId },
        { $pull: { partIds: id } }
      );
    }

    await Equipment.deleteOne({ _id: id });
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting equipment:", err);
    res.status(400).send("Error deleting equipment: " + err);
  }
};

router.get("/", getEquipmentHandler);
router.post("/", postEquipmentHandler);
router.put("/:id", updateEquipmentHandler);
router.delete("/:id", deleteEquipmentHandler);

export default router;