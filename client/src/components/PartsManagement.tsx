import React, { useState, useEffect } from "react";
import { getAllInventory, addInventory, updateInventory, deleteInventory } from "../services/equipmentService";

const PartsManagement: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const fetchInventory = async () => {
    const data = await getAllInventory();
    setInventory(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = { name, stock: parseInt(stock), category: category || undefined };
    const addedItem = await addInventory(newItem);
    if (addedItem) {
      setInventory([...inventory, addedItem]);
      setName("");
      setStock("");
      setCategory("");
    }
  };

  const handleEditStart = (item: any) => {
    setEditingId(item._id);
    setEditName(item.name);
    setEditStock(item.stock.toString());
    setEditCategory(item.category || "");
  };

  const handleEditSave = async (id: string) => {
    const updates = { name: editName, stock: parseInt(editStock), category: editCategory || undefined };
    const updatedItem = await updateInventory(id, updates);
    if (updatedItem) {
      setInventory(inventory.map(item => item._id === id ? updatedItem : item));
      setEditingId(null);
      setEditName("");
      setEditStock("");
      setEditCategory("");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditStock("");
    setEditCategory("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this part?")) {
      await deleteInventory(id);
      setInventory(inventory.filter(item => item._id !== id));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Parts Management</h2>
      <form onSubmit={handleAdd} className="mb-6 flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Part Name"
          className="border p-2"
          required
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          className="border p-2"
          required
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Part</button>
      </form>
      <ul className="space-y-2">
        {inventory.map((item) => (
          <li key={item._id} className="flex gap-4 items-center">
            {editingId === item._id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-1"
                />
                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="border p-1"
                />
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="border p-1"
                />
                <button onClick={() => handleEditSave(item._id)} className="bg-green-500 text-white p-1 rounded">Save</button>
                <button onClick={handleEditCancel} className="bg-gray-500 text-white p-1 rounded">Cancel</button>
              </>
            ) : (
              <>
                <span>{item.name} (Stock: {item.stock}) {item.category ? `- ${item.category}` : ""}</span>
                <button onClick={() => handleEditStart(item)} className="bg-yellow-500 text-white p-1 rounded">Edit</button>
                <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PartsManagement;