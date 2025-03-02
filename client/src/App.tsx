import React, { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import EquipmentForm from "./components/EquipmentForm";
import TaskForm from "./components/TaskForm";
import EquipmentTree from "./components/EquipmentTree";
import ManageEquipment from "./components/ManageEquipment";
import NavSidebar from "./components/NavSidebar";
import Dashboard from "./components/Dashboard";
import { AppProvider, useAppContext } from "./context/AppContext";

ChartJS.register(ArcElement, Tooltip, Legend);

interface AppContentProps {}

const AppContent: React.FC<AppContentProps> = () => {
  const { equipmentData, inventoryData, maintenanceTasks, reportFilter, dateFilter, setReportFilter, setDateFilter, fetchData, handleTaskUpdated, handleTaskDeleted, handleEquipmentUpdated, handleEquipmentDeleted } = useAppContext();
  const [activeSection, setActiveSection] = useState("dashboard");
  const topLevelEquipment = equipmentData.filter((e) => !e.parentId);
  const equipmentWithTasks = topLevelEquipment.filter((equip) =>
    maintenanceTasks.some((task) => task.equipmentId === equip.id)
  );

  const handleDateFilterChange = (type: "start" | "end", value: string) => {
    setDateFilter((prev) => ({ ...prev, [type]: value }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return (
          <div className="max-h-[600px] overflow-auto p-6">
            {equipmentWithTasks.length > 0 ? (
              equipmentWithTasks.map((equip) => (
                <EquipmentTree
                  key={equip.id}
                  equipment={equip}
                  allEquipment={equipmentData}
                  inventoryData={inventoryData}
                  maintenanceTasks={maintenanceTasks}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                  onEquipmentUpdated={handleEquipmentUpdated}
                  onEquipmentDeleted={handleEquipmentDeleted}
                />
              ))
            ) : (
              <p className="text-gray-600">No equipment with tasks found</p>
            )}
          </div>
        );
      case "add-equipment":
        return (
          <EquipmentForm
            equipmentData={equipmentData}
            inventoryData={inventoryData}
            onEquipmentAdded={fetchData}
          />
        );
      case "add-task":
        return (
          <TaskForm
            equipmentData={equipmentData}
            onTaskAdded={fetchData}
          />
        );
      case "reports":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-2">Task Report</h2>
            <div className="flex gap-4 mb-4">
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value as "all" | "completed" | "incomplete")}
                className="border p-2"
              >
                <option value="all">All Tasks</option>
                <option value="completed">Completed Tasks</option>
                <option value="incomplete">Incomplete Tasks</option>
              </select>
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => handleDateFilterChange("start", e.target.value)}
                placeholder="Start Date"
                className="border p-2"
              />
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => handleDateFilterChange("end", e.target.value)}
                placeholder="End Date"
                className="border p-2"
              />
            </div>
          </div>
        );
      case "manage-equipment":
        return <ManageEquipment />;
      case "full-hierarchy":
        return (
          <div className="max-h-[600px] overflow-auto">
            {equipmentData.length > 0 ? (
              topLevelEquipment.length > 0 ? (
                topLevelEquipment.map((equip) => (
                  <EquipmentTree
                    key={equip.id}
                    equipment={equip}
                    allEquipment={equipmentData}
                    inventoryData={inventoryData}
                    maintenanceTasks={maintenanceTasks}
                    onTaskUpdated={handleTaskUpdated}
                    onTaskDeleted={handleTaskDeleted}
                    onEquipmentUpdated={handleEquipmentUpdated}
                    onEquipmentDeleted={handleEquipmentDeleted}
                    level={0}
                  />
                ))
              ) : (
                <p>No top-level equipment found</p>
              )
            ) : (
              <p>No equipment found</p>
            )}
          </div>
        );
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="flex">
      <NavSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1">{renderContent()}</div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;