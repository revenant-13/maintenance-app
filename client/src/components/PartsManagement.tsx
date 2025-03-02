import React, { useState } from "react";
import { updateEquipment } from "../services/equipmentService";

interface PartsManagementProps {
  equipmentId: string;
  inventoryPartIds: string[];
  availableParts: { _id: string; name: string; stock: number; category?: string }[];
  onPartsUpdated: (updatedPartIds: string[]) => Promise<void>;
  onClose: () => void;
}

const PartsManagement: React.FC<PartsManagementProps> = ({
  equipmentId,
  inventoryPartIds,
  availableParts,
  onPartsUpdated,
  onClose,
}) => {
  const [currentPartIds, setCurrentPartIds] = useState<string[]>(inventoryPartIds);
  const [newPartId, setNewPartId] = useState("");

  const handleAddPart = async () => {
    if (newPartId && !currentPartIds.includes(newPartId)) {
      const updatedPartIds = [...currentPartIds, newPartId];
      setCurrentPartIds(updatedPartIds);
      setNewPartId("");
      await onPartsUpdated(updatedPartIds);
    }
  };

  const handleRemovePart = async (partId: string) => {
    const updatedPartIds = currentPartIds.filter((id) => id !== partId);
    setCurrentPartIds(updatedPartIds);
    await onPartsUpdated(updatedPartIds);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Parts for Equipment</h3>
      <button onClick={onClose} className="float-right text-gray-500">Close</button>
      <div className="mb-4">
        <select
          value={newPartId}
          onChange={(e) => setNewPartId(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select a Part</option>
          {availableParts
            .filter((part) => !currentPartIds.includes(part._id))
            .map((part) => (
              <option key={part._id} value={part._id}>
                {part.name} (Stock: {part.stock})
              </option>
            ))}
        </select>
        <button
          onClick={handleAddPart}
          className="mt-2 bg-blue-500 text-white p-2 rounded"
        >
          Add Part
        </button>
      </div>
      <ul className="space-y-2">
        {currentPartIds.map((partId) => {
          const part = availableParts.find((p) => p._id === partId);
          return part ? (
            <li key={part._id} className="flex justify-between items-center">
              <span>{part.name} (Stock: {part.stock})</span>
              <button
                onClick={() => handleRemovePart(part._id)}
                className="bg-red-500 text-white p-1 rounded"
              >
                Remove
              </button>
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );
};

export default PartsManagement;