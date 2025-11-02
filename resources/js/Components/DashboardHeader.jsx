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
  HiOutlineMenu,
  HiOutlineMail,
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineExternalLink
} from "react-icons/hi";
import { FiChevronDown } from "react-icons/fi";
import defaultUser from "../../assets/front/imgs/default-user.png";

const NOTIFICATION_ICONS = {
  contact_message: HiOutlineMail,
  new_order: HiOutlineShoppingCart,
  new_user: HiOutlineUser,
};

export default function DashboardHeader({
  user = { name: "Admin", avatar: null },
  title = "Dashboard",
  onSidebarToggle,
  showSearch = false
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const dropdownRef = useRef();
  const notificationRef = useRef();
  const searchRef = useRef();

  // Charger les notifications
  const loadNotifications = async () => {
    if (notificationsLoading) return;

    setNotificationsLoading(true);
    try {
      const response = await fetch(route('admin.notifications.header'));
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    loadNotifications();
  }, []);

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      await fetch(route('admin.notifications.read', notificationId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
      });

      // Mettre à jour immédiatement l'état local
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Recharger les notifications pour être sûr
      setTimeout(loadNotifications, 500);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await fetch(route('admin.notifications.mark-all-read'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
      });

      // Mettre à jour immédiatement l'état local
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);

      // Recharger les notifications pour être sûr
      setTimeout(loadNotifications, 500);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
    }
  };

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

  const getNotificationIcon = (type) => {
    const IconComponent = NOTIFICATION_ICONS[type] || HiOutlineBell;
    return IconComponent;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 overflow-x-hidden">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Left side */}
        <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
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
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight truncate max-w-[60vw] sm:max-w-none">{title}</h1>
            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
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
        <div className="flex items-center space-x-1.5 md:space-x-2">
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
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                if (!notificationOpen) {
                  loadNotifications();
                }
              }}
              className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <HiOutlineBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
              {notificationOpen && (
              <div className="fixed right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl py-2 animate-fade-in z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 font-medium hover:text-blue-700"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2">Chargement...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <HiOutlineBell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      return (
                        <Link
                          key={notification.id}
                          href={route('admin.notifications.show', notification.id)}
                          onClick={() => setNotificationOpen(false)}
                          className={`block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notification.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                              notification.color === 'green' ? 'bg-green-100 text-green-600' :
                              notification.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                              notification.color === 'red' ? 'bg-red-100 text-red-600' :
                              notification.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {notification.title}
                                </p>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  {!notification.is_read && (
                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {notification.time_ago}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                {notification.message}
                              </p>
                              {notification.action_url && (
                                <div className="mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setNotificationOpen(false);
                                      window.location.href = route('admin.notifications.redirect', notification.id);
                                    }}
                                    className="text-xs text-green-600 hover:text-green-700 font-medium inline-flex items-center"
                                  >
                                    <HiOutlineExternalLink className="h-3 w-3 mr-1" />
                                    Aller à l'élément
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <Link
                      href={route('admin.notifications.index')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => setNotificationOpen(false)}
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
            href={route('admin.settings.index')}
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
              <div className="fixed right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 animate-fade-in z-50">
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
                    href={route('admin.users.show', user.id)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HiOutlineUserCircle className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">Mon profil</span>
                  </Link>

                  <Link
                    href={route('admin.settings.index')}
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </header>
  );
}
