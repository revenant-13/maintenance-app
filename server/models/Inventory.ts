import mongoose, { Schema, Document } from "mongoose";

export interface IInventory extends Document {
  _id: string;
  name: string;
  stock: number;
  category?: string;
}

const InventorySchema: Schema = new Schema({
  _id: { type: String },
  name: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  category: { type: String },
}, { _id: false });

export default mongoose.model<IInventory>("Inventory", InventorySchema);