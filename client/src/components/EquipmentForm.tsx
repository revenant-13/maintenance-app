import React, { useState } from "react";
import { Equipment } from "../types/equipment";
import { addEquipment } from "../services/equipmentService";

interface EquipmentFormProps {
  equipmentData: Equipment[];
  inventoryData: any[];
  onEquipmentAdded: () => Promise<void>;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ equipmentData, inventoryData, onEquipmentAdded }) => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [selectedInventoryParts, setSelectedInventoryParts] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEquipment: Partial<Equipment> = {
      name,
      parentId: parentId || undefined,
      partIds: selectedParts,
      inventoryPartIds: selectedInventoryParts,
    };
    const addedEquipment = await addEquipment(newEquipment);
    if (addedEquipment) {
      await onEquipmentAdded();
      setName("");
      setParentId("");
      setSelectedParts([]);
      setSelectedInventoryParts([]);
    }
  };

  const handlePartToggle = (partId: string) => {
    setSelectedParts((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  const handleInventoryPartToggle = (partId: string) => {
    setSelectedInventoryParts((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Add Equipment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Equipment Name"
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Parent Equipment:</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="">None</option>
            {equipmentData.map((equip) => (
              <option key={equip.id} value={equip.id}>
                {equip.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold">Sub-Equipment:</label>
          <div className="max-h-40 overflow-auto border p-2 rounded">
            {equipmentData.map((equip) => (
              <div key={equip.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedParts.includes(equip.id)}
                  onChange={() => handlePartToggle(equip.id)}
                  className="mr-2"
                />
                <span>{equip.name}</span>
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
                  checked={selectedInventoryParts.includes(part._id)}
                  onChange={() => handleInventoryPartToggle(part._id)}
                  className="mr-2"
                />
                <span>{part.name} (Stock: {part.stock})</span>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add Equipment
        </button>
      </form>
    </div>
  );
};

export default EquipmentForm;