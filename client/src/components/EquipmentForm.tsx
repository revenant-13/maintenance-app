import React, { useState } from "react";
import { Equipment } from "../types/equipment";
import { addEquipment } from "../services/equipmentService";

interface EquipmentFormProps {
  equipmentData: Equipment[];
  inventoryData: { _id: string; name: string; stock: number; category?: string }[];
  onEquipmentAdded: () => Promise<void>;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ equipmentData, inventoryData, onEquipmentAdded }) => {
  const [newEquipmentName, setNewEquipmentName] = useState("");
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined);
  const [selectedInventoryPartIds, setSelectedInventoryPartIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipmentName.trim()) {
      setErrorMessage("Equipment name is required");
      return;
    }
    if (selectedParentId && selectedPartIds.includes(selectedParentId)) {
      setErrorMessage("An equipment cannot be both a parent and a sub-equipment");
      return;
    }

    const newEquipment: Partial<Equipment> = {
      id: `equip-${Date.now()}`,
      name: newEquipmentName,
      partIds: selectedPartIds,
      parentId: selectedParentId,
      inventoryPartIds: selectedInventoryPartIds,
    };
    const added = await addEquipment(newEquipment);
    if (added) {
      await onEquipmentAdded();
      setNewEquipmentName("");
      setSelectedPartIds([]);
      setSelectedParentId(undefined);
      setSelectedInventoryPartIds([]);
      setErrorMessage("");
    } else {
      setErrorMessage("Failed to add equipment");
    }
  };

  const handlePartToggle = (partId: string) => {
    setSelectedPartIds((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  const toggleInventoryPart = (partId: string) => {
    setSelectedInventoryPartIds((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  const availableSubEquipment = equipmentData.filter((e) => !e.parentId); // Hide assigned equipment
  const availableParentEquipment = equipmentData;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Add Equipment</h2>
      <form onSubmit={handleAddEquipment} className="mb-4">
        <input
          type="text"
          value={newEquipmentName}
          onChange={(e) => setNewEquipmentName(e.target.value)}
          placeholder="Enter equipment name"
          className="border p-2 mr-2 mb-2 w-full"
        />
        {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
        <div className="mb-2">
          <label className="block font-semibold">Parent Equipment:</label>
          <select
            value={selectedParentId || ""}
            onChange={(e) => setSelectedParentId(e.target.value || undefined)}
            className="border p-2 w-full"
          >
            <option value="">None (Top Level)</option>
            {availableParentEquipment.map((equip) => (
              <option key={equip.id} value={equip.id}>
                {equip.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <p className="font-semibold">Sub-Equipment:</p>
          {availableSubEquipment.length > 0 ? (
            availableSubEquipment.map((equip) => (
              <label key={equip.id} className="block">
                <input
                  type="checkbox"
                  checked={selectedPartIds.includes(equip.id)}
                  onChange={() => handlePartToggle(equip.id)}
                  className="mr-2"
                />
                {equip.name}
              </label>
            ))
          ) : (
            <p>No available sub-equipment</p>
          )}
        </div>
        <div className="mb-2">
          <p className="font-semibold">Inventory Parts:</p>
          {inventoryData.length > 0 ? (
            inventoryData.map((part) => (
              <label key={part._id} className="block">
                <input
                  type="checkbox"
                  checked={selectedInventoryPartIds.includes(part._id)}
                  onChange={() => toggleInventoryPart(part._id)}
                  className="mr-2"
                />
                {part.name} (Stock: {part.stock})
              </label>
            ))
          ) : (
            <p>No inventory parts available</p>
          )}
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Equipment
        </button>
      </form>
    </div>
  );
};

export default EquipmentForm;