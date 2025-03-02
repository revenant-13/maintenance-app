import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { deleteEquipment, updateEquipment } from "../services/equipmentService";
import { Equipment } from "../types/equipment";

const ManageEquipment: React.FC = () => {
  const { equipmentData, inventoryData, handleEquipmentUpdated, handleEquipmentDeleted } = useAppContext();
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const handleDelete = async (id: string, partIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete this equipment?`)) {
      try {
        await deleteEquipment(id);
        await handleEquipmentDeleted(id, partIds);
      } catch (error) {
        alert("Failed to delete equipment: " + error);
      }
    }
  };

  const handleEditStart = (equip: Equipment) => {
    setEditingEquipment({ ...equip });
  };

  const handleEditSave = async () => {
    if (!editingEquipment || !editingEquipment.name.trim()) {
      alert("Equipment name is required");
      return;
    }
    try {
      const updatedEquipment = await updateEquipment(editingEquipment.id, {
        name: editingEquipment.name,
        partIds: editingEquipment.partIds || [],
        inventoryPartIds: editingEquipment.inventoryPartIds || [],
      });
      if (updatedEquipment) {
        handleEquipmentUpdated(updatedEquipment);
        setEditingEquipment(null);
      }
    } catch (error) {
      alert("Failed to update equipment: " + error);
    }
  };

  const handleEditCancel = () => {
    setEditingEquipment(null);
  };

  const handlePartToggle = (partId: string) => {
    if (!editingEquipment) return;
    setEditingEquipment((prev) => {
      const partIds = prev?.partIds || [];
      return {
        ...prev!,
        partIds: partIds.includes(partId)
          ? partIds.filter((id) => id !== partId)
          : [...partIds, partId],
      };
    });
  };

  const handleInventoryPartToggle = (partId: string) => {
    if (!editingEquipment) return;
    setEditingEquipment((prev) => {
      const inventoryPartIds = prev?.inventoryPartIds || [];
      return {
        ...prev!,
        inventoryPartIds: inventoryPartIds.includes(partId)
          ? inventoryPartIds.filter((id) => id !== partId)
          : [...inventoryPartIds, partId],
      };
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Manage Equipment</h2>
      {equipmentData.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left text-gray-700 font-semibold">Name</th>
                <th className="p-3 text-left text-gray-700 font-semibold">Sub-Equipment</th>
                <th className="p-3 text-left text-gray-700 font-semibold">Inventory Parts</th>
                <th className="p-3 text-left text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipmentData.map((equip) => (
                <tr key={equip.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{equip.name}</td>
                  <td className="p-3">
                    {equip.partIds && equip.partIds.length > 0
                      ? equip.partIds
                          .map((id) => equipmentData.find((e) => e.id === id)?.name || "Unknown")
                          .join(", ")
                      : "None"}
                  </td>
                  <td className="p-3">
                    {equip.inventoryPartIds && equip.inventoryPartIds.length > 0
                      ? equip.inventoryPartIds
                          .map((id) => inventoryData.find((i) => i._id === id)?.name || "Unknown")
                          .join(", ")
                      : "None"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEditStart(equip)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(equip.id, equip.partIds || [])}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No equipment found</p>
      )}

      {editingEquipment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Equipment</h3>
            <input
              type="text"
              value={editingEquipment.name}
              onChange={(e) => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
              placeholder="Equipment Name"
              className="border p-2 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mb-4">
              <p className="font-semibold text-gray-700 mb-2">Sub-Equipment:</p>
              {equipmentData.map((equip) => (
                equip.id !== editingEquipment.id && (
                  <label key={equip.id} className="block mb-1">
                    <input
                      type="checkbox"
                      checked={editingEquipment.partIds?.includes(equip.id) || false}
                      onChange={() => handlePartToggle(equip.id)}
                      className="mr-2"
                    />
                    {equip.name}
                  </label>
                )
              ))}
            </div>
            <div className="mb-4">
              <p className="font-semibold text-gray-700 mb-2">Inventory Parts:</p>
              {inventoryData.map((part) => (
                <label key={part._id} className="block mb-1">
                  <input
                    type="checkbox"
                    checked={editingEquipment.inventoryPartIds?.includes(part._id) || false}
                    onChange={() => handleInventoryPartToggle(part._id)}
                    className="mr-2"
                  />
                  {part.name} (Stock: {part.stock})
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEditSave}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
              >
                Save
              </button>
              <button
                onClick={handleEditCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEquipment;