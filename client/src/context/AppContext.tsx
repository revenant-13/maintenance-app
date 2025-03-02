import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { Equipment } from "../types/equipment";
import { getAllEquipment, getAllInventory, getAllMaintenanceTasks, updateEquipment } from "../services/equipmentService";

interface DateFilter {
  start: string;
  end: string;
}

interface AppContextType {
  equipmentData: Equipment[];
  inventoryData: any[];
  maintenanceTasks: any[];
  reportFilter: "all" | "completed" | "incomplete";
  dateFilter: DateFilter;
  taskStats: { total: number; completed: number; incomplete: number; overdue: number };
  equipmentTaskStats: { [equipmentId: string]: { total: number; completed: number; incomplete: number; overdue: number } };
  activeSection: string;
  setReportFilter: (filter: "all" | "completed" | "incomplete") => void;
  setDateFilter: (filter: DateFilter | ((prev: DateFilter) => DateFilter)) => void;
  setActiveSection: (section: string) => void;
  fetchData: () => Promise<void>;
  handleTaskUpdated: (updatedTask: any) => void;
  handleTaskDeleted: (taskId: string) => void;
  handleEquipmentUpdated: (updatedEquipment: Equipment) => void;
  handleEquipmentDeleted: (equipmentId: string, partIds: string[]) => void;
  updateEquipmentParts: (equipmentId: string, updatedPartIds: string[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([]);
  const [reportFilter, setReportFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>({ start: "", end: "" });
  const [activeSection, setActiveSection] = useState("dashboard");

  const fetchData = async () => {
    const equipData = await getAllEquipment();
    const invData = await getAllInventory();
    const tasksData = await getAllMaintenanceTasks();
    setEquipmentData(equipData);
    setInventoryData(invData);
    setMaintenanceTasks(tasksData);
    console.log("Fetched Equipment:", equipData.map(e => ({ id: e.id, name: e.name, parentId: e.parentId, partIds: e.partIds })));
    console.log("Fetched Tasks:", tasksData);
  };

  const fetchTasksWithFilter = useCallback(async () => {
    let url = "http://localhost:3001/maintenance-tasks";
    const params = new URLSearchParams();
    if (reportFilter !== "all") {
      params.append("completed", reportFilter === "completed" ? "true" : "false");
    }
    if (dateFilter.start) params.append("start", dateFilter.start);
    if (dateFilter.end) params.append("end", dateFilter.end);
    if (params.toString()) url += `?${params.toString()}`;
    const response = await fetch(url);
    const tasksData = await response.json();
    setMaintenanceTasks(tasksData);
  }, [reportFilter, dateFilter]);

  const taskStats = {
    total: maintenanceTasks.length,
    completed: maintenanceTasks.filter(task => task.completed).length,
    incomplete: maintenanceTasks.filter(task => !task.completed).length,
    overdue: maintenanceTasks.filter(task => !task.completed && new Date(task.schedule) < new Date()).length,
  };

  const equipmentTaskStats = equipmentData.reduce((stats, equip) => {
    const tasksForEquip = maintenanceTasks.filter(task => task.equipmentId === equip.id);
    stats[equip.id] = {
      total: tasksForEquip.length,
      completed: tasksForEquip.filter(task => task.completed).length,
      incomplete: tasksForEquip.filter(task => !task.completed).length,
      overdue: tasksForEquip.filter(task => !task.completed && new Date(task.schedule) < new Date()).length,
    };
    return stats;
  }, {} as { [equipmentId: string]: { total: number; completed: number; incomplete: number; overdue: number } });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchTasksWithFilter();
  }, [reportFilter, dateFilter, fetchTasksWithFilter]);

  const handleTaskUpdated = (updatedTask: any) => {
    setMaintenanceTasks((prevTasks) =>
      prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
  };

  const handleTaskDeleted = (taskId: string) => {
    setMaintenanceTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
  };

  const handleEquipmentUpdated = async (updatedEquipment: Equipment) => {
    setEquipmentData((prevEquipment) =>
      prevEquipment.map((equip) => (equip.id === updatedEquipment.id ? updatedEquipment : equip))
    );
    await fetchData();
  };

  const handleEquipmentDeleted = async (equipmentId: string, partIds: string[]) => {
    const equipData = await getAllEquipment();
    const invData = await getAllInventory();
    const tasksData = await getAllMaintenanceTasks();
    setEquipmentData(equipData);
    setInventoryData(invData);
    setMaintenanceTasks(tasksData);
    console.log("Fetched Tasks after delete:", tasksData);
    if (equipData.length === 0) {
      setMaintenanceTasks([]);
    }
  };

  const updateEquipmentParts = async (equipmentId: string, updatedPartIds: string[]) => {
    const equipment = equipmentData.find((e) => e.id === equipmentId);
    if (equipment) {
      // Prevent sub-equipment loops by removing this equipment from other parents
      for (const partId of updatedPartIds) {
        const parentEquip = equipmentData.find(
          (e) => e.id !== equipmentId && e.partIds && e.partIds.includes(partId)
        );
        if (parentEquip && parentEquip.partIds) {
          await updateEquipment(parentEquip.id, {
            partIds: parentEquip.partIds.filter((pid: string) => pid !== partId),
          });
        }
      }

      const updatedEquipment = await updateEquipment(equipmentId, {
        ...equipment,
        inventoryPartIds: updatedPartIds,
      });
      if (updatedEquipment) {
        setEquipmentData((prev) =>
          prev.map((e) => (e.id === equipmentId ? updatedEquipment : e))
        );
        await fetchData(); // Refresh to ensure consistency
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        equipmentData,
        inventoryData,
        maintenanceTasks,
        reportFilter,
        dateFilter,
        taskStats,
        equipmentTaskStats,
        activeSection,
        setReportFilter,
        setDateFilter,
        setActiveSection,
        fetchData,
        handleTaskUpdated,
        handleTaskDeleted,
        handleEquipmentUpdated,
        handleEquipmentDeleted,
        updateEquipmentParts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};