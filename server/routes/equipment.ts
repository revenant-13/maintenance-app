import express, { Request, Response, RequestHandler } from "express";
import Equipment, { IEquipment } from "../models/Equipment";
import MaintenanceTask from "../models/MaintenanceTask";

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

      await Equipment.updateMany(
        { _id: { $in: partIds } },
        { $set: { parentId: newEquipment._id } }
      );
    }

    const savedEquipment = await newEquipment.save();

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

const updateEquipmentHandler: RequestHandler<{ id: string }, any, Partial<IEquipment>> = async (
  req: Request<{ id: string }, any, Partial<IEquipment>>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, partIds, inventoryPartIds } = req.body;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      res.status(404).send("Equipment not found");
      return;
    }

    if (partIds) {
      const oldSubEquipment = await Equipment.find({ parentId: id });
      for (const sub of oldSubEquipment) {
        if (!partIds.includes(sub._id.toString())) {
          await Equipment.updateOne(
            { _id: sub._id },
            { $set: { parentId: null } }
          );
        }
      }

      const subEquipment = await Equipment.find({ _id: { $in: partIds } });
      for (const sub of subEquipment) {
        if (sub.parentId && sub.parentId !== id) {
          await Equipment.updateOne(
            { _id: sub.parentId },
            { $pull: { partIds: sub._id } }
          );
        }
      }
      console.log("Updating sub-equipment parentId to:", id);
      console.log("Sub-equipment IDs:", partIds);
      await Equipment.updateMany(
        { _id: { $in: partIds } },
        { $set: { parentId: id } }
      );
      console.log("Updated sub-equipment:", await Equipment.find({ _id: { $in: partIds } }));
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      id,
      { $set: { name, partIds, inventoryPartIds } },
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

    if (equipment.partIds && equipment.partIds.length > 0) {
      await Equipment.updateMany(
        { _id: { $in: equipment.partIds } },
        { $set: { parentId: null } }
      );
    }

    if (equipment.parentId) {
      await Equipment.updateOne(
        { _id: equipment.parentId },
        { $pull: { partIds: id } }
      );
    }

    await MaintenanceTask.deleteMany({ equipmentId: id });

    const result = await Equipment.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new Error("Failed to delete equipment");
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting equipment:", err);
    res.status(500).send("Error deleting equipment: " + err);
  }
};

const getTasksHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const tasks = await MaintenanceTask.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).send("Error fetching tasks: " + err);
  }
};

const postTaskHandler: RequestHandler<{}, any, { equipmentId: string; type: string; schedule: string; description?: string; completed?: boolean }> = async (
  req: Request<{}, any, { equipmentId: string; type: string; schedule: string; description?: string; completed?: boolean }>,
  res: Response
) => {
  try {
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
    console.error("Error adding task:", err);
    res.status(400).send("Error adding task: " + err);
  }
};

const updateTaskHandler: RequestHandler<{ id: string }, any, Partial<{ equipmentId: string; type: string; schedule: string; description?: string; completed?: boolean }>> = async (
  req: Request<{ id: string }, any, Partial<{ equipmentId: string; type: string; schedule: string; description?: string; completed?: boolean }>>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTask = await MaintenanceTask.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    if (!updatedTask) {
      res.status(404).send("Task not found");
      return;
    }
    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(400).send("Error updating task: " + err);
  }
};

const deleteTaskHandler: RequestHandler<{ id: string }> = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await MaintenanceTask.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      res.status(404).send("Task not found");
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(400).send("Error deleting task: " + err);
  }
};

router.get("/", getEquipmentHandler); // Changed from "/equipment"
router.post("/", postEquipmentHandler); // Changed from "/equipment"
router.put("/:id", updateEquipmentHandler);
router.delete("/:id", deleteEquipmentHandler);
router.get("/maintenance-tasks", getTasksHandler);
router.post("/maintenance-tasks", postTaskHandler);
router.put("/maintenance-tasks/:id", updateTaskHandler);
router.delete("/maintenance-tasks/:id", deleteTaskHandler);

export default router;