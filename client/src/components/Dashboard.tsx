import React from "react";
import { Pie } from "react-chartjs-2";
import { useAppContext } from "../context/AppContext";

const Dashboard: React.FC = () => {
  const { equipmentData, maintenanceTasks, taskStats, equipmentTaskStats } = useAppContext();
  const overdueTasks = maintenanceTasks.filter(task => !task.completed && new Date(task.schedule) < new Date());

  const chartData = {
    labels: ["Completed", "Incomplete", "Overdue"],
    datasets: [
      {
        data: [taskStats.completed, taskStats.incomplete - taskStats.overdue, taskStats.overdue],
        backgroundColor: ["#10B981", "#EF4444", "#F59E0B"],
        hoverBackgroundColor: ["#059669", "#DC2626", "#D97706"],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { position: "top" as const },
      tooltip: { callbacks: { label: (context: any) => `${context.label}: ${context.raw}` } },
    },
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Task Dashboard</h2>
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Total Tasks</h3>
          <p className="text-3xl text-gray-800">{taskStats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-green-600">Completed</h3>
          <p className="text-3xl text-green-600">{taskStats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-red-600">Incomplete</h3>
          <p className="text-3xl text-red-600">{taskStats.incomplete}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-yellow-600">Overdue</h3>
          <p className="text-3xl text-yellow-600">{taskStats.overdue}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Task Status Chart</h3>
        <div className="h-64">
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div>
      {taskStats.overdue > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Overdue Tasks</h3>
          <ul className="list-disc ml-6 text-sm max-h-40 overflow-auto">
            {overdueTasks.map((task) => (
              <li key={task._id}>
                {task.type}: {task.description} (Due: {task.schedule.split("T")[0]}) - Assigned to {equipmentData.find(e => e.id === task.equipmentId)?.name || "Unknown"}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-gray-700 mb-2">Tasks by Equipment</h3>
        <div className="grid grid-cols-2 gap-4 max-h-40 overflow-auto">
          {equipmentData.map((equip) => {
            const stats = equipmentTaskStats[equip.id] || { total: 0, completed: 0, incomplete: 0, overdue: 0 };
            return (
              <div key={equip.id} className="bg-blue-50 p-4 rounded">
                <h4 className="font-semibold text-blue-600">{equip.name}</h4>
                <p>Total: {stats.total}</p>
                <p>Completed: {stats.completed}</p>
                <p>Incomplete: {stats.incomplete}</p>
                <p>Overdue: {stats.overdue}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;