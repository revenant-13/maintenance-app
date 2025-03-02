import React, { useState } from "react";
import { addMaintenanceTask } from "../services/equipmentService";
import { Equipment } from "../types/equipment";

interface TaskFormProps {
  equipmentData: Equipment[];
  onTaskAdded: () => Promise<void>;
}

const TaskForm: React.FC<TaskFormProps> = ({ equipmentData, onTaskAdded }) => {
  const [equipmentId, setEquipmentId] = useState("");
  const [type, setType] = useState<"Calibration" | "PM" | "">("");
  const [schedule, setSchedule] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string>("");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId.trim() || !type.trim() || !schedule.trim()) {
      setError("Please fill in all required fields (Equipment, Type, Schedule)");
      return;
    }

    const newTask = {
      equipmentId,
      type,
      schedule,
      description: description || undefined,
      completed: false,
    };

    try {
      const addedTask = await addMaintenanceTask(newTask);
      if (addedTask) {
        await onTaskAdded();
        console.log("Task added and state refreshed:", addedTask);
        setEquipmentId("");
        setType("");
        setSchedule("");
        setDescription("");
        setError("");
      } else {
        setError("Failed to add task—server rejected request");
      }
    } catch (error) {
      setError("Failed to add task: " + error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Add Maintenance Task</h2>
      <form onSubmit={handleAddTask} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label className="block font-semibold">Equipment:</label>
          <select
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="">Select Equipment</option>
            {equipmentData.map((equip) => (
              <option key={equip.id} value={equip.id}>
                {equip.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold">Type:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "Calibration" | "PM" | "")}
            className="border p-2 w-full rounded"
          >
            <option value="">Select Type</option>
            <option value="Calibration">Calibration</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold">Schedule:</label>
          <input
            type="date"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task Description"
            className="border p-2 w-full rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add Task
        </button>
      </form>
    </div>
  );
};

export default TaskForm;