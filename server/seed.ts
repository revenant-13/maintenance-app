import mongoose from "mongoose";
import Equipment, { IEquipment } from "./models/Equipment";

mongoose
  .connect("mongodb://localhost:27017/maintenance-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

interface SeedEquipment {
  _id: string;
  name: string;
  parentId?: string;
  partIds?: string[];
  inventoryPartIds?: string[];
}

const sampleData: SeedEquipment[] = [
  { _id: "equip-001", name: "Pump B", partIds: ["equip-002", "equip-003"] },
  { _id: "equip-002", name: "Motor", parentId: "equip-001" },
  { _id: "equip-003", name: "Valve", parentId: "equip-001" },
];

async function seedDatabase() {
  try {
    await Equipment.deleteMany({});
    await Equipment.insertMany(sampleData);
    console.log("Database seeded with sample equipment!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

seedDatabase();