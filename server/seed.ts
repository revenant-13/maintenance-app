import mongoose from "mongoose";
import Equipment, { IEquipment } from "./models/Equipment";

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/maintenance-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a type for seeding (without full Document properties)
interface SeedEquipment {
  _id: string;
  name: string;
  parentId?: string;
  partIds?: string[];
}

// Sample data
const sampleData: SeedEquipment[] = [
  {
    name: "Pump B",
    partIds: ["equip-002", "equip-003"],
    _id: "equip-001",
  },
  {
    name: "Motor",
    parentId: "equip-001",
    _id: "equip-002",
  },
  {
    name: "Valve",
    parentId: "equip-001",
    _id: "equip-003",
  },
];

// Seed function
async function seedDatabase() {
  try {
    await Equipment.deleteMany({}); // Clear existing data
    await Equipment.insertMany(sampleData);
    console.log("Database seeded with sample equipment!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

seedDatabase();