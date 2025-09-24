import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineTruck,
  HiOutlineUsers,
} from "react-icons/hi";

const links = [
  { route: "admin.dashboard", label: "Dashboard", icon: <HiOutlineHome /> },
  { route: "admin.orders.index", label: "Orders", icon: <HiOutlineClipboardList /> },
  { route: "admin.payments.index", label: "Payments", icon: <HiOutlineClipboardList /> },
  { route: "admin.shippings.index", label: "Shipping Methods", icon: <HiOutlineTruck /> },
  { route: "admin.categories.list", label: "Categories", icon: <HiOutlineClipboardList /> },
  { route: "admin.subcategories.list", label: "Subcategories", icon: <HiOutlineClipboardList /> },
  { route: "admin.suppliers.list", label: "Suppliers", icon: <HiOutlineClipboardList /> },
  { route: "admin.brands.list", label: "Brands", icon: <HiOutlineClipboardList /> },
  { route: "admin.products.list", label: "Products", icon: <HiOutlineChartBar /> },
  { route: "admin.colors.list", label: "Colors", icon: <HiOutlineChartBar /> },
  { route: "admin.sizes.list", label: "Sizes", icon: <HiOutlineChartBar /> },
  { route: "admin.customers.index", label: "Customers", icon: <HiOutlineUserGroup /> },
  { route: "admin.users.index", label: "Users & Roles", icon: <HiOutlineUsers /> },
  // { route: "admin.settings", label: "Settings", icon: <HiOutlineCog /> },
];

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(null);

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300
        ${collapsed ? "w-16" : "w-56"}`}
    >
      <div className={`flex items-center px-4 py-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        <span
          className={`font-bold text-xl text-[#8c6c3c] transition-opacity duration-300 ${collapsed ? "w-0" : ""}`} style={{ opacity: collapsed ? 0 : 1 }}
        >
          EcomAdmin
        </span>
        <button
          className={`text-gray-400 hover:text-gray-700 transition ${collapsed ? "z-50" : ""}`}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <span className="text-2xl">&#9776;</span> // ☰
          ) : (
            <span className="text-2xl">&times;</span> // ✖
          )}
        </button>
      </div>
      <nav className="flex-1 mt-6 space-y-2">
        {links.map((link) => (
          <Link
            key={link.route}
            href={route(link.route)}
            // onClick={(e) => e.stopPropagation()}
            className={`group flex items-center px-4 py-2 rounded-lg transition
              ${hovered === link.href || !collapsed ? "text-[#a68e55] relative left-0 bg-white w-fit" : "text-gray-500"}
              ${collapsed ? "justify-center" : "gap-3"}
            `}
            onMouseEnter={() => setHovered(link.href)}
            onMouseLeave={() => setHovered(null)}
            aria-label={link.label}
          >
            <span className="text-xl">{link.icon}</span>
            {/* Texte animé à droite de l'icône, uniquement sur hover si collapsed */}
            <span
              className={`sidebar-label font-medium ml-2 transition-all duration-300
                ${collapsed
                  ? hovered === link.href
                    ? "opacity-100 w-auto max-w-[120px]"
                    : "opacity-0 w-0 max-w-0"
                  : "opacity-100 w-auto max-w-[120px]"}
              `}
              style={{
                display: collapsed && hovered !== link.href ? "none" : "inline-block",
              }}
            >
              {link.label}
            </span>
          </Link>
        ))}
      </nav>
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
      <style>{`
        .sidebar-label {
          transition: opacity .25s cubic-bezier(.4,0,.2,1), max-width .25s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </aside>
  );
}
