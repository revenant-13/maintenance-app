import mongoose, { Schema, Document } from "mongoose";

export interface IInventory extends Document {
  name: string;
  stock: number;
  category?: string;
}

const InventorySchema: Schema = new Schema({
  name: { type: String, required: true },
  stock: { type: Number, required: true },
  category: { type: String },
});

export default mongoose.model<IInventory>("Inventory", InventorySchema);