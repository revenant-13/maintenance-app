import express, { Request, Response, RequestHandler } from "express";
import Inventory, { IInventory } from "../models/Inventory";

const router = express.Router();

const getInventoryHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const inventory: IInventory[] = await Inventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).send("Error fetching inventory: " + err);
  }
};

router.get("/", getInventoryHandler);

export default router;