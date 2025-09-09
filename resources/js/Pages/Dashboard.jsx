import { Head, Link } from "@inertiajs/react";
import React, { useState } from "react";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineUserCircle,
  HiOutlineChartBar,
} from "react-icons/hi";
import { FiChevronDown } from "react-icons/fi";

// Dummy user data (à remplacer par auth.user)
const user = {
  name: "Jean Dupont",
  email: "jean.dupont@email.com",
  avatar: "/assets/front/imgs/user1.webp",
};

// Navigation links
const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <HiOutlineHome /> },
  { href: "/projects", label: "Projects", icon: <HiOutlineClipboardList /> },
  { href: "/tasks", label: "Tasks", icon: <HiOutlineChartBar /> },
  { href: "/users", label: "Users", icon: <HiOutlineUserGroup /> },
  { href: "/settings", label: "Settings", icon: <HiOutlineCog /> },
];

// ---------------------------- Components ----------------------------

function SearchBar() {
  return (
    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition">
      <input
        type="text"
        placeholder="Search tasks, projects..."
        className="bg-transparent rounded-full outline-none border-none flex-1 text-gray-700 placeholder-gray-400"
      />
      <button className="ml-2 text-gray-400 hover:text-gray-700 transition">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="9" r="7" />
          <line x1="15" y1="15" x2="20" y2="20" />
        </svg>
      </button>
    </div>
  );
}

function UserProfileDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative ml-4">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white hover:bg-gray-100 transition shadow-sm"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
        <span className="font-medium text-gray-700 hidden sm:inline">{user.name}</span>
        <FiChevronDown className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 animate-fade-in">
          <Link
            href="/profile"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
          >
            <HiOutlineUserCircle className="mr-2" /> Profile
          </Link>
          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
          >
            <HiOutlineCog className="mr-2" /> Settings
          </Link>
          <Link
            href="/logout"
            method="post"
            as="button"
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
          >
            <HiOutlineLogout className="mr-2" /> Log Out
          </Link>
        </div>
      )}
    </div>
  );
}

function Notifications() {
  return (
    <button className="relative ml-4 text-gray-400 hover:text-blue-500 transition">
      <HiOutlineBell size={22} />
      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1">
        3
      </span>
    </button>
  );
}

function Sidebar({ collapsed, setCollapsed }) {
  const [hovered, setHovered] = useState(null);

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300
        ${collapsed ? "w-16" : "w-56"}`}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-4 py-4">
        <span
          className={`font-bold text-xl text-blue-600 transition-opacity duration-300 ${
            collapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto block"
          }`}
        >
          MyApp
        </span>
        {console.log(collapsed)}
        <button
          className="text-gray-400 hover:text-gray-700 transition"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <span className="text-3xl">&times;</span> : <span className="text-3xl">&#9776;</span>}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 mt-6 space-y-2">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex items-center px-4 py-2 rounded-lg transition-colors duration-200
              ${hovered === link.href || !collapsed ? "bg-gray-100 text-blue-600" : "text-gray-500"}
              ${collapsed ? "z-10 w-max relative" : "gap-3"}
            `}
            onMouseEnter={() => setHovered(link.href)}
            onMouseLeave={() => setHovered(null)}
            aria-label={link.label}
          >
            <span className="text-xl">{link.icon}</span>
            {/* Label visible au hover si collapsed */}
            <span
              className={`sidebar-label font-medium ml-2 transition-all duration-300
                ${collapsed
                  ? hovered === link.href
                    ? "opacity-100 w-auto max-w-[120px]"
                    : "opacity-0 w-0 max-w-0"
                  : "opacity-100 w-auto max-w-[120px]"}`}
              style={{
                display: collapsed && hovered !== link.href ? "none" : "inline-block",
              }}
            >
              {link.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto mb-6 px-4">
        <Link
          href="/logout"
          method="post"
          as="button"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
        >
          <HiOutlineLogout className="text-xl" />
          <span className={collapsed ? "hidden" : "inline"}>Log Out</span>
        </Link>
      </div>

      {/* Label animation */}
      <style>{`
        .sidebar-label {
          transition: opacity .25s cubic-bezier(.4,0,.2,1), max-width .25s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </aside>
  );
}

// ---------------------------- Dashboard ----------------------------

export default function Dashboard({
  auth,
  myPendingTasks = 0,
  myProgressTasks = 0,
  myCompletedTasks = 0,
  activeTasks = { data: [] },
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <Head title="Dashboard" />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
            <SearchBar />
            <div className="flex items-center">
              <Notifications />
              <UserProfileDropdown />
            </div>
          </header>

          {/* Dashboard body */}
          <main className="flex-1 p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start transition hover:shadow-lg">
                <span className="text-amber-500 text-2xl font-semibold">{myPendingTasks}</span>
                <span className="mt-2 text-gray-700 font-medium">Pending Tasks</span>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start transition hover:shadow-lg">
                <span className="text-blue-500 text-2xl font-semibold">{myProgressTasks}</span>
                <span className="mt-2 text-gray-700 font-medium">In Progress</span>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start transition hover:shadow-lg">
                <span className="text-green-500 text-2xl font-semibold">{myCompletedTasks}</span>
                <span className="mt-2 text-gray-700 font-medium">Completed</span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">My Active Tasks</h2>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Project</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTasks.data.map((task) => (
                    <tr key={task.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="px-3 py-2">{task.id}</td>
                      <td className="px-3 py-2 text-blue-600 hover:underline">
                        <Link href={route("admin.projects.show", task.project_id)}>
                          {task.project?.name || "N/A"}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-gray-700">{task.name}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium text-white ${
                            task.status === "pending"
                              ? "bg-amber-500"
                              : task.status === "progress"
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{task.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fade-in { animation: fade-in .25s ease; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: none;} }
      `}</style>
    </>
  );
}