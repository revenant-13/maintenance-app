import React, { useState } from "react";
import { Equipment } from "../types/equipment";
import { updateMaintenanceTask, updateEquipment, deleteEquipment, deleteMaintenanceTask } from "../services/equipmentService";
import { useAppContext } from "../context/AppContext";

interface EquipmentTreeProps {
  equipment: Equipment;
  allEquipment: Equipment[];
  inventoryData: { _id: string; name: string; stock: number; category?: string }[];
  maintenanceTasks: { _id: string; equipmentId: string; type: string; schedule: string; description?: string; completed?: boolean }[];
  onTaskUpdated: (updatedTask: any) => void;
  onTaskDeleted: (taskId: string) => void;
  onEquipmentUpdated: (updatedEquipment: Equipment) => void;
  onEquipmentDeleted: (equipmentId: string, partIds: string[]) => void;
  level?: number;
}

const EquipmentTree: React.FC<EquipmentTreeProps> = ({ 
  equipment, 
  allEquipment, 
  inventoryData, 
  maintenanceTasks, 
  onTaskUpdated, 
  onTaskDeleted, 
  onEquipmentUpdated, 
  onEquipmentDeleted, 
  level = 0 
}) => {
  const { activeSection } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(level > 0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(equipment.name);
  const parts = (equipment.partIds || []).map((partId: string) =>
    allEquipment.find((item) => item.id === partId)
  ).filter((part): part is Equipment => !!part);

  const inventoryParts = (equipment.inventoryPartIds || []).map((partId: string) =>
    inventoryData.find((item) => item._id === partId)
  ).filter((part): part is { _id: string; name: string; stock: number; category?: string } => !!part);

  const tasks = maintenanceTasks.filter((task) => task.equipmentId === equipment.id);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editType, setEditType] = useState<"Calibration" | "PM" | "">("");
  const [editSchedule, setEditSchedule] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");

  const handleTaskToggle = async (taskId: string, currentCompleted: boolean) => {
    const updatedTask = await updateMaintenanceTask(taskId, { completed: !currentCompleted });
    if (updatedTask) {
      onTaskUpdated(updatedTask);
    }
  };

  const handleEditTaskStart = (task: { _id: string; type: string; schedule: string; description?: string }) => {
    setEditingTaskId(task._id);
    setEditType(task.type as "Calibration" | "PM");
    setEditSchedule(task.schedule.split("T")[0]);
    setEditDescription(task.description || "");
  };

  const handleEditTaskSave = async (taskId: string) => {
    const updates = {
      type: editType,
      schedule: editSchedule,
      description: editDescription || undefined,
    };
    const updatedTask = await updateMaintenanceTask(taskId, updates);
    if (updatedTask) {
      onTaskUpdated(updatedTask);
      setEditingTaskId(null);
    }
  };

  const handleEditTaskCancel = () => {
    setEditingTaskId(null);
  };

  const handleTaskDelete = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteMaintenanceTask(taskId);
        onTaskDeleted(taskId);
      } catch (error) {
        alert("Failed to delete task: " + error);
      }
    }
  };

  const handleNameEditSave = async () => {
    if (!newName.trim()) return;
    const updatedEquipment = await updateEquipment(equipment.id, { name: newName });
    if (updatedEquipment) {
      onEquipmentUpdated(updatedEquipment);
      setIsEditingName(false);
    }
  };

  const handleNameEditCancel = () => {
    setNewName(equipment.name);
    setIsEditingName(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${equipment.name}?`)) {
      try {
        await deleteEquipment(equipment.id);
        await onEquipmentDeleted(equipment.id, equipment.partIds || []);
      } catch (error) {
        alert("Failed to delete equipment: " + error);
      }
    }
  };

  return (
    <div className={`ml-${level * 4}`}>
      <div className="flex items-center">
        {(parts.length > 0 || tasks.length > 0) && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mr-2 text-blue-500"
          >
            {isCollapsed ? "▶" : "▼"}
          </button>
        )}
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border p-1 w-40"
            />
            <button onClick={handleNameEditSave} className="bg-green-500 text-white p-1 rounded text-xs">
              Save
            </button>
            <button onClick={handleNameEditCancel} className="bg-gray-500 text-white p-1 rounded text-xs">
              Cancel
            </button>
            <button onClick={handleDelete} className="bg-red-500 text-white p-1 rounded text-xs">
              Delete
            </button>
          </div>
        ) : (
          <span
            className="font-semibold text-gray-800 cursor-pointer hover:underline"
            onClick={() => setIsEditingName(true)}
          >
            {equipment.name}
          </span>
        )}
      </div>
      {!isCollapsed && (
        <>
          {activeSection !== "tasks" && inventoryParts.length > 0 && (
            <ul className="list-disc ml-6 mt-1 text-sm text-gray-500">
              {inventoryParts.map((part) => (
                <li key={part._id}>{part.name} (Stock: {part.stock})</li>
              ))}
            </ul>
          )}
          {tasks.length > 0 && (
            <ul className="list-disc ml-6 mt-1 text-sm text-blue-600">
              {tasks.map((task) => (
                <li key={task._id}>
                  {editingTaskId === task._id ? (
                    <div className="flex flex-col gap-2">
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as "Calibration" | "PM")}
                        className="border p-1"
                      >
                        <option value="Calibration">Calibration</option>
                        <option value="PM">PM</option>
                      </select>
                      <input
                        type="date"
                        value={editSchedule}
                        onChange={(e) => setEditSchedule(e.target.value)}
                        className="border p-1"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        className="border p-1"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleEditTaskSave(task._id)} className="bg-green-500 text-white p-1 rounded">
                          Save
                        </button>
                        <button onClick={handleEditTaskCancel} className="bg-gray-500 text-white p-1 rounded">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={task.completed || false}
                        onChange={() => handleTaskToggle(task._id, task.completed || false)}
                        className="mr-2"
                      />
                      {task.type} (Due: {task.schedule.split("T")[0]})
                      {task.completed ? " - Completed" : ""}
                      <button
                        onClick={() => handleEditTaskStart(task)}
                        className="ml-2 bg-yellow-500 text-white p-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleTaskDelete(task._id)}
                        className="ml-2 bg-red-500 text-white p-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          {parts.length > 0 && (
            <ul className="mt-1">
              {parts.map((part) => (
                <li key={part.id} className="text-gray-600">
                  <EquipmentTree
                    equipment={part}
                    allEquipment={allEquipment}
                    inventoryData={inventoryData}
                    maintenanceTasks={maintenanceTasks}
                    onTaskUpdated={onTaskUpdated}
                    onTaskDeleted={onTaskDeleted}
                    onEquipmentUpdated={onEquipmentUpdated}
                    onEquipmentDeleted={onEquipmentDeleted}
                    level={level + 1}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default EquipmentTree;