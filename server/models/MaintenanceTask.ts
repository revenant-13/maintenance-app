import mongoose, { Schema, Document } from "mongoose";

export interface IMaintenanceTask extends Document {
  _id: string;
  equipmentId: string;
  type: "Calibration" | "PM";
  schedule: Date;
  description?: string;
  completed?: boolean;
}

const MaintenanceTaskSchema: Schema = new Schema({
  _id: { type: String },
  equipmentId: { type: String, ref: "Equipment", required: true },
  type: { type: String, enum: ["Calibration", "PM"], required: true },
  schedule: { type: Date, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
}, { _id: false });

export default mongoose.model<IMaintenanceTask>("MaintenanceTask", MaintenanceTaskSchema);