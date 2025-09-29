import React, { useState, useRef, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { 
  HiOutlineBell, 
  HiOutlineCog, 
  HiOutlineLogout, 
  HiOutlineUserCircle,
  HiOutlineSearch,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineMenu
} from "react-icons/hi";
import { FiChevronDown } from "react-icons/fi";
import defaultUser from "../../assets/front/imgs/default-user.png";

export default function DashboardHeader({ 
  user = { name: "Admin", avatar: null },
  title = "Dashboard",
  notifications = [],
  onSidebarToggle,
  showSearch = false
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const dropdownRef = useRef();
  const notificationRef = useRef();
  const searchRef = useRef();

  // Ferme les dropdowns si on clique dehors
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          {onSidebarToggle && (
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <HiOutlineMenu className="h-6 w-6" />
            </button>
          )}

          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Center - Search (if enabled) */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-lg mx-8" ref={searchRef}>
            <div className="relative w-full">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onFocus={() => setSearchOpen(true)}
              />
              
              {/* Search dropdown */}
              {searchOpen && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl py-2 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Résultats pour "{searchQuery}"
                  </div>
                  {/* Ici vous pouvez ajouter les résultats de recherche */}
                  <div className="px-4 py-8 text-center text-gray-500">
                    Aucun résultat trouvé
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Search button (mobile) */}
          {showSearch && (
            <button className="md:hidden p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <HiOutlineSearch className="h-5 w-5" />
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <HiOutlineSun className="h-5 w-5" />
            ) : (
              <HiOutlineMoon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <HiOutlineBell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl py-2 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadNotifications > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      {unreadNotifications} non lue(s)
                    </span>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <HiOutlineBell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Aucune notification</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification, index) => (
                      <div
                        key={index}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 5 && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <Link
                      href="/admin/notifications"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir toutes les notifications
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            href="/admin/settings"
            className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Paramètres"
          >
            <HiOutlineCog className="h-5 w-5" />
          </Link>

          {/* User profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center space-x-3 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <img
                src={user.avatar || defaultUser}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover border border-gray-300"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role || 'Administrateur'}</p>
              </div>
              <FiChevronDown 
                className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} 
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 animate-fade-in">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar || defaultUser}
                      alt={user.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <Link
                    href="/admin/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HiOutlineUserCircle className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">Mon profil</span>
                  </Link>
                  
                  <Link
                    href="/admin/settings"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HiOutlineCog className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">Paramètres</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-2">
                  <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <HiOutlineLogout className="h-5 w-5" />
                    <span className="font-medium">Déconnexion</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .animate-fade-in { 
          animation: fade-in 0.2s ease-out; 
        }
        @keyframes fade-in { 
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          } 
          to { 
            opacity: 1; 
            transform: none; 
          } 
        }
      `}</style>
    </header>
  );
}