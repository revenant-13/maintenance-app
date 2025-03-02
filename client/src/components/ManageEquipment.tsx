import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { updateEquipment, deleteEquipment } from "../services/equipmentService";

const ManageEquipment: React.FC = () => {
  const { equipmentData, inventoryData, fetchData } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPartIds, setEditPartIds] = useState<string[]>([]);
  const [editInventoryPartIds, setEditInventoryPartIds] = useState<string[]>([]);
  const [viewPartsId, setViewPartsId] = useState<string | null>(null); // Tracks viewed parts
  const [isAddingParts, setIsAddingParts] = useState(false); // Toggle add parts mode
  const [newPartId, setNewPartId] = useState(""); // Selected part to add

  const handleEditStart = (equip: any) => {
    setEditingId(equip.id);
    setEditName(equip.name);
    setEditPartIds(equip.partIds || []);
    setEditInventoryPartIds(equip.inventoryPartIds || []);
  };

  const handleEditSave = async (id: string) => {
    for (const partId of editPartIds) {
      const parentEquip = equipmentData.find((e) => e.id !== id && e.partIds && e.partIds.includes(partId));
      if (parentEquip && parentEquip.partIds) {
        await updateEquipment(parentEquip.id, {
          partIds: parentEquip.partIds.filter((pid: string) => pid !== partId),
        });
      }
    }

    const updates = { name: editName, partIds: editPartIds, inventoryPartIds: editInventoryPartIds };
    const updatedEquipment = await updateEquipment(id, updates);
    if (updatedEquipment) {
      await fetchData();
      setEditingId(null);
      setEditName("");
      setEditPartIds([]);
      setEditInventoryPartIds([]);
      setViewPartsId(null); // Hide parts after save
      setIsAddingParts(false); // Reset add mode
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditPartIds([]);
    setEditInventoryPartIds([]);
    setViewPartsId(null);
    setIsAddingParts(false);
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

  const handleAddPart = () => {
    if (newPartId && !editInventoryPartIds.includes(newPartId)) {
      setEditInventoryPartIds([...editInventoryPartIds, newPartId]);
      setNewPartId(""); // Reset selection
    }
  };

  const handleRemovePart = (partId: string) => {
    setEditInventoryPartIds(editInventoryPartIds.filter((id) => id !== partId));
  };

  const toggleViewParts = (id: string) => {
    setViewPartsId(viewPartsId === id ? null : id);
    setIsAddingParts(false); // Reset add mode when toggling view
  };

  const getDescendants = (equipId: string, allEquipment: any[], visited: Set<string> = new Set()): string[] => {
    const descendants: string[] = [];
    if (visited.has(equipId)) return descendants;
    visited.add(equipId);

    const findDescendants = (id: string) => {
      const children = allEquipment.filter((e) => e.parentId === id);
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
          const validSubEquipment = equipmentData.filter(
            (e) => e.id !== equip.id && !descendants.includes(e.id)
          );
          const equipmentParts = (equip.inventoryPartIds || []).map((partId: string) =>
            inventoryData.find((item) => item._id === partId)
          ).filter((part): part is { _id: string; name: string; stock: number; category?: string } => !!part);

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
                    {viewPartsId === equip.id && (
                      <>
                        <ul className="list-disc ml-6 mt-1 text-sm text-gray-500">
                          {equipmentParts.map((part) => (
                            <li key={part._id} className="flex items-center gap-2">
                              {part.name} (Stock: {part.stock})
                              <button
                                onClick={() => handleRemovePart(part._id)}
                                className="bg-red-500 text-white p-1 rounded text-xs"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                        {isAddingParts ? (
                          <div className="mt-2 flex gap-2">
                            <select
                              value={newPartId}
                              onChange={(e) => setNewPartId(e.target.value)}
                              className="border p-1"
                            >
                              <option value="">Select a Part</option>
                              {inventoryData
                                .filter((part) => !editInventoryPartIds.includes(part._id))
                                .map((part) => (
                                  <option key={part._id} value={part._id}>
                                    {part.name} (Stock: {part.stock})
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={handleAddPart}
                              className="bg-blue-500 text-white p-1 rounded text-xs"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setIsAddingParts(false)}
                              className="bg-gray-500 text-white p-1 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingParts(true)}
                            className="mt-2 bg-green-500 text-white p-1 rounded text-xs"
                          >
                            Add Part
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleEditSave(equip.id)} className="bg-green-500 text-white p-2 rounded">
                      Save
                    </button>
                    <button onClick={handleEditCancel} className="bg-gray-500 text-white p-2 rounded">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>{equip.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleViewParts(equip.id)}
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      {viewPartsId === equip.id ? "Hide Parts" : "View Parts"}
                    </button>
                    <button onClick={() => handleEditStart(equip)} className="bg-yellow-500 text-white p-2 rounded">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(equip.id)} className="bg-red-500 text-white p-2 rounded">
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