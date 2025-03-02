import express, { RequestHandler, Router } from "express";
import Inventory from "../models/Inventory";

const router = express.Router();

const getInventoryHandler: RequestHandler = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).send("Error fetching inventory: " + err);
  }
};

const postInventoryHandler: RequestHandler = async (req, res) => {
  try {
    const { name, stock, category } = req.body;
    if (!name || stock === undefined) {
      res.status(400).send("Name and stock are required");
      return;
    }
    const newInventory = new Inventory({ name, stock, category });
    const savedInventory = await newInventory.save();
    res.status(201).json(savedInventory);
  } catch (err) {
    res.status(400).send("Error adding inventory: " + err);
  }
};

const putInventoryHandler: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedInventory = await Inventory.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!updatedInventory) {
      res.status(404).send("Inventory not found");
      return;
    }
    res.json(updatedInventory);
  } catch (err) {
    res.status(400).send("Error updating inventory: " + err);
  }
};

const deleteInventoryHandler: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Inventory.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      res.status(404).send("Inventory not found");
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).send("Error deleting inventory: " + err);
  }
};

router.get("/", getInventoryHandler);
router.post("/", postInventoryHandler);
router.put("/:id", putInventoryHandler);
router.delete("/:id", deleteInventoryHandler);

export default router;