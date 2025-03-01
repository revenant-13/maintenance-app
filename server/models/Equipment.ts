import mongoose, { Schema, Document } from "mongoose";

export interface IEquipment extends Document {
  _id: string;
  name: string;
  parentId?: string;
  partIds?: string[]; // Sub-equipment IDs
  inventoryPartIds?: string[]; // Inventory part IDs
  inventoryId?: string;
}

const EquipmentSchema: Schema = new Schema({
  _id: { type: String },
  name: { type: String, required: true },
  parentId: { type: String, ref: "Equipment" },
  partIds: [{ type: String, ref: "Equipment" }],
  inventoryPartIds: [{ type: String, ref: "Inventory" }], // Reference Inventory model
  inventoryId: { type: String },
}, { _id: false });

export default mongoose.model<IEquipment>("Equipment", EquipmentSchema);