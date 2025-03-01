import mongoose from "mongoose";
import Inventory, { IInventory } from "./models/Inventory";

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/maintenance-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define seed interface matching IInventory
interface SeedInventory {
  _id: string;
  name: string;
  stock: number;
  category?: string;
}

// Initial inventory data
const sampleData: SeedInventory[] = [
  { _id: "part-001", name: "Motor Type A", stock: 10, category: "Electrical" },
  { _id: "part-002", name: "Bolt 10mm", stock: 100, category: "Mechanical" },
  { _id: "part-003", name: "Rotor", stock: 5, category: "Electrical" },
  { _id: "part-004", name: "Bearing", stock: 30, category: "Mechanical" },
  { _id: "part-005", name: "Seal", stock: 50, category: "Mechanical" },
];

async function seedInventory() {
  try {
    await Inventory.deleteMany({}); // Clear existing inventory
    await Inventory.insertMany(sampleData);
    console.log("Inventory seeded with sample parts!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding inventory:", err);
  }
}

seedInventory();