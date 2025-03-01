import mongoose, { Schema, Document } from "mongoose";

export interface IEquipment extends Document {
  _id: string; // Explicitly string, not ObjectId
  name: string;
  parentId?: string;
  partIds?: string[];
  inventoryId?: string;
}

const EquipmentSchema: Schema = new Schema({
  _id: { type: String }, // Override default ObjectId
  name: { type: String, required: true },
  parentId: { type: String, ref: "Equipment" },
  partIds: [{ type: String, ref: "Equipment" }],
  inventoryId: { type: String },
}, { _id: false }); // Disable auto _id generation

export default mongoose.model<IEquipment>("Equipment", EquipmentSchema);