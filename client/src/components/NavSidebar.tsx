import React from "react";

interface NavSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const NavSidebar: React.FC<NavSidebarProps> = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: "dashboard", label: "Dashboard" },
    { id: "tasks", label: "Tasks" },
    { id: "add-equipment", label: "Add Equipment" },
    { id: "add-task", label: "Add Task" },
    { id: "reports", label: "Reports" },
    { id: "full-hierarchy", label: "Full Hierarchy" },
    { id: "manage-equipment", label: "Manage Equipment" },
  ];

  return (
    <div className="w-52 bg-gray-800 text-white h-screen p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-6">Maintenance App</h2>
      <ul className="space-y-3">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left py-2 px-4 rounded transition-colors ${
                activeSection === section.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavSidebar;