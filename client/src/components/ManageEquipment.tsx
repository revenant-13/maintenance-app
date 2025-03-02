import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { updateEquipment, deleteEquipment } from "../services/equipmentService";

const ManageEquipment: React.FC = () => {
  const { equipmentData, inventoryData, fetchData } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPartIds, setEditPartIds] = useState<string[]>([]);
  const [editInventoryPartIds, setEditInventoryPartIds] = useState<string[]>([]);

  const handleEditStart = (equip: any) => {
    setEditingId(equip.id);
    setEditName(equip.name);
    setEditPartIds(equip.partIds || []);
    setEditInventoryPartIds(equip.inventoryPartIds || []);
  };

  const handleEditSave = async (id: string) => {
    // Remove this equipment's ID from other equipment's partIds to avoid overlap
    for (const partId of editPartIds) {
      const parentEquip = equipmentData.find(
        (e) => e.id !== id && e.partIds && e.partIds.includes(partId)
      );
      if (parentEquip && parentEquip.partIds) {
        await updateEquipment(parentEquip.id, {
          partIds: parentEquip.partIds.filter((pid: string) => pid !== partId),
        });
      }
    }

    const updates = {
      name: editName,
      partIds: editPartIds,
      inventoryPartIds: editInventoryPartIds,
    };
    const updatedEquipment = await updateEquipment(id, updates);
    if (updatedEquipment) {
      await fetchData(); // Refresh data after save
      setEditingId(null);
      setEditName("");
      setEditPartIds([]);
      setEditInventoryPartIds([]);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditPartIds([]);
    setEditInventoryPartIds([]);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      await deleteEquipment(id);
      await fetchData();
    }
  };

  const togglePart = (partId: string) => {
    setEditPartIds((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  const toggleInventoryPart = (partId: string) => {
    setEditInventoryPartIds((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  const getDescendants = (equipId: string, allEquipment: any[]): string[] => {
    const descendants: string[] = [];
    const visited = new Set<string>();

    const findDescendants = (id: string) => {
      const children = allEquipment.filter((e) => e.partIds?.includes(id));
      children.forEach((child) => {
        if (!visited.has(child.id)) {
          descendants.push(child.id);
          visited.add(child.id);
          findDescendants(child.id);
        }
      });
    };
    findDescendants(equipId);
    return descendants;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Manage Equipment</h2>
      <ul className="space-y-4">
        {equipmentData.map((equip) => {
          const descendants = getDescendants(equip.id, equipmentData);
          // Filter valid sub-equipment: exclude self, descendants, and items that would create cycles
          const validSubEquipment = equipmentData.filter(
            (e) =>
              e.id !== equip.id && // Exclude self
              !descendants.includes(e.id) && // Exclude descendants
              !editPartIds.some((pid) => getDescendants(pid, equipmentData).includes(e.id)) // Prevent cycles
          );

          return (
            <li key={equip.id} className="border p-4 rounded">
              {editingId === equip.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border p-2 w-full rounded"
                  />
                  <div>
                    <label className="block font-semibold">Sub-Equipment:</label>
                    <div className="max-h-40 overflow-auto border p-2 rounded">
                      {validSubEquipment.map((part) => (
                        <div key={part.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editPartIds.includes(part.id)}
                            onChange={() => togglePart(part.id)}
                            className="mr-2"
                          />
                          <span>{part.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold">Inventory Parts:</label>
                    <div className="max-h-40 overflow-auto border p-2 rounded">
                      {inventoryData.map((part) => (
                        <div key={part._id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editInventoryPartIds.includes(part._id)}
                            onChange={() => toggleInventoryPart(part._id)}
                            className="mr-2"
                          />
                          <span>{part.name} (Stock: {part.stock})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(equip.id)}
                      className="bg-green-500 text-white p-2 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="bg-gray-500 text-white p-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>{equip.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditStart(equip)}
                      className="bg-yellow-500 text-white p-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(equip.id)}
                      className="bg-red-500 text-white p-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ManageEquipment;