import mongoose from "mongoose";
import Equipment from "./models/Equipment";
import Inventory from "./models/Inventory";
import MaintenanceTask from "./models/MaintenanceTask";

async function seed() {
  try {
    await mongoose.connect("mongodb://localhost:27017/maintenance-app");

    await Equipment.deleteMany({});
    await Inventory.deleteMany({});
    await MaintenanceTask.deleteMany({});

    const inventoryData = [
      { _id: "part-001", name: "Motor Type A", stock: 10 },
      { _id: "part-002", name: "Bolt 10mm", stock: 100 },
      { _id: "part-003", name: "Rotor", stock: 5 },
      { _id: "part-004", name: "Bearing", stock: 30 },
      { _id: "part-005", name: "Seal", stock: 50 },
    ];

    const equipmentData = [
      {
        _id: "equip-1740853973466",
        name: "Machine1",
        partIds: ["equip-001"],
        inventoryPartIds: ["part-002"],
      },
      {
        _id: "equip-001",
        name: "Pump B",
        partIds: ["equip-002", "equip-003"],
        parentId: "equip-1740853973466",
        inventoryPartIds: ["part-003", "part-004"],
      },
      {
        _id: "equip-002",
        name: "Motor",
        parentId: "equip-001",
        inventoryPartIds: ["part-003", "part-004"],
      },
      {
        _id: "equip-003",
        name: "Valve",
        parentId: "equip-001",
        inventoryPartIds: ["part-005"],
      },
      {
        _id: "equip-1740854041276",
        name: "Fan Blade",
        inventoryPartIds: ["part-003"],
      },
    ];

    const maintenanceTasksData = [
      {
        _id: "task-001",
        equipmentId: "equip-001",
        type: "Calibration",
        schedule: "2025-03-15",
        description: "Calibrate pump pressure",
        completed: false,
      },
      {
        _id: "task-002",
        equipmentId: "equip-002",
        type: "PM",
        schedule: "2025-03-20",
        description: "Replace motor oil",
        completed: false,
      },
      {
        _id: "task-003",
        equipmentId: "equip-003",
        type: "Calibration",
        schedule: "2025-04-01",
        description: "Check valve alignment",
        completed: false,
      },
    ];

    await Inventory.insertMany(inventoryData);
    await Equipment.insertMany(equipmentData);
    await MaintenanceTask.insertMany(maintenanceTasksData);

    console.log("Database seeded successfully");
    await mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
    await mongoose.connection.close();
  }
}

seed();