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
    { id: "manage-equipment", label: "Manage Equipment" },
    { id: "full-hierarchy", label: "Full Hierarchy" },
    { id: "parts-management", label: "Parts Management" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h1 className="text-xl font-bold mb-6">Maintenance App</h1>
      <nav>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-2 rounded ${
                  activeSection === section.id ? "bg-gray-600" : "hover:bg-gray-700"
                }`}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default NavSidebar;