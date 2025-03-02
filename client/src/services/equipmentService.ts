import axios from "axios";
import { Equipment } from "../types/equipment";

const API_URL = "http://localhost:3001";

export const getAllEquipment = async (): Promise<Equipment[]> => {
  try {
    const response = await axios.get(`${API_URL}/equipment`);
    return response.data.map((item: any) => ({ ...item, id: item._id }));
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return [];
  }
};

export const addEquipment = async (equipment: Partial<Equipment>): Promise<Equipment | null> => {
  try {
    const payload = { ...equipment, _id: equipment.id, partIds: equipment.partIds || [], inventoryPartIds: equipment.inventoryPartIds || [] };
    delete payload.id;
    const response = await axios.post(`${API_URL}/equipment`, payload);
    return { ...response.data, id: response.data._id };
  } catch (error) {
    console.error("Error adding equipment:", error);
    return null;
  }
};

export const updateEquipment = async (id: string, updates: Partial<Equipment>): Promise<Equipment | null> => {
  try {
    const response = await axios.put(`${API_URL}/equipment/${id}`, updates);
    return { ...response.data, id: response.data._id };
  } catch (error) {
    console.error("Error updating equipment:", error);
    return null;
  }
};

export const deleteEquipment = async (id: string): Promise<void> => {
  try {
    const response = await axios.delete(`${API_URL}/equipment/${id}`);
    if (response.status !== 204) throw new Error("Failed to delete equipment");
  } catch (error) {
    console.error("Error deleting equipment:", error);
    throw error;
  }
};

export const getAllInventory = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/inventory`);
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
};

export const addInventory = async (inventory: { name: string; stock: number; category?: string }): Promise<any | null> => {
  try {
    const response = await axios.post(`${API_URL}/inventory`, inventory);
    return response.data;
  } catch (error) {
    console.error("Error adding inventory:", error);
    return null;
  }
};

export const updateInventory = async (id: string, updates: Partial<{ name: string; stock: number; category?: string }>): Promise<any | null> => {
  try {
    const response = await axios.put(`${API_URL}/inventory/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error("Error updating inventory:", error);
    return null;
  }
};

export const deleteInventory = async (id: string): Promise<void> => {
  try {
    const response = await axios.delete(`${API_URL}/inventory/${id}`);
    if (response.status !== 204) throw new Error("Failed to delete inventory");
  } catch (error) {
    console.error("Error deleting inventory:", error);
    throw error;
  }
};

export const getAllMaintenanceTasks = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/maintenance-tasks`);
    return response.data;
  } catch (error) {
    console.error("Error fetching maintenance tasks:", error);
    return [];
  }
};

export const addMaintenanceTask = async (task: { equipmentId: string; type: string; schedule: string; description?: string; completed?: boolean }): Promise<any | null> => {
  try {
    const response = await axios.post(`${API_URL}/maintenance-tasks`, task);
    return response.data;
  } catch (error) {
    console.error("Error adding maintenance task:", error);
    return null;
  }
};

export const updateMaintenanceTask = async (id: string, updates: Partial<{ equipmentId: string; type: string; schedule: string; description?: string; completed?: boolean }>): Promise<any | null> => {
  try {
    const response = await axios.put(`${API_URL}/maintenance-tasks/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error("Error updating maintenance task:", error);
    return null;
  }
};

export const deleteMaintenanceTask = async (id: string): Promise<void> => {
  try {
    const response = await axios.delete(`${API_URL}/maintenance-tasks/${id}`);
    if (response.status !== 204) throw new Error("Failed to delete task");
  } catch (error) {
    console.error("Error deleting maintenance task:", error);
    throw error;
  }
};