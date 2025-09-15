import React, { useState, useRef, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { HiOutlineBell, HiOutlineCog, HiOutlineLogout, HiOutlineUserCircle } from "react-icons/hi";
import { FiChevronDown } from "react-icons/fi";
import defaultUser from "../../assets/front/imgs/default-user.png";

export default function DashboardHeader({ user = { name: "Admin" } }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Ferme le dropdown si on clique dehors
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between relative z-10">
      <h1 className="text-2xl font-bold text-[#8c6c3c] tracking-tight">Dashboard</h1>
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-blue-500 transition focus:outline-none">
          <HiOutlineBell size={24} />
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1">
            3
          </span>
        </button>
        {/* Settings shortcut */}
        <Link
          href="/settings"
          className="text-gray-400 hover:text-[#a68e55] transition p-2 rounded-full hover:bg-gray-100"
          aria-label="Settings"
        >
          <HiOutlineCog size={22} />
        </Link>
        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-50 hover:bg-gray-100 transition shadow border border-gray-200 focus:outline-none"
            onClick={() => setDropdownOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <img
              src={defaultUser}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-300"
            />
            <span className="font-medium text-gray-700 hidden sm:inline">{user.name}</span>
            <FiChevronDown className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-2 ring-1 ring-[#a68e55]/20 animate-fade-in">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-[#f7f3ee] transition font-medium"
              >
                <HiOutlineUserCircle className="text-[#a68e55]" size={20} />
                Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-[#f7f3ee] transition font-medium"
              >
                <HiOutlineCog className="text-[#8c6c3c]" size={20} />
                Settings
              </Link>
              <Link
                href="/logout"
                method="post"
                as="button"
                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-[#f7f3ee] transition font-medium"
              >
                <HiOutlineLogout className="text-red-500" size={20} />
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fade-in .25s ease; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: none;} }
      `}</style>
    </header>
  );
}