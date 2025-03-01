import mongoose, { Schema, Document } from "mongoose";

export interface IEquipment extends Document {
  _id: string;
  name: string;
  parentId?: string;
  partIds?: string[];
  parts?: string[];
  inventoryId?: string;
}

const EquipmentSchema: Schema = new Schema({
  _id: { type: String },
  name: { type: String, required: true },
  parentId: { type: String, ref: "Equipment" },
  partIds: [{ type: String, ref: "Equipment" }],
  parts: [{ type: String }],
  inventoryId: { type: String },
}, { _id: false });

export default mongoose.model<IEquipment>("Equipment", EquipmentSchema);