import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineTruck,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineCollection,
  HiOutlineOfficeBuilding,
  HiOutlineBell,
  HiOutlineColorSwatch,
  HiOutlineCube,
  HiOutlineCash,
  HiOutlineMail,
  HiChevronDown,
  HiOutlineMenuAlt3,
  HiOutlineX,
} from "react-icons/hi";

// Configuration des liens avec sous-menus
const navigationLinks = [
  { 
    route: "admin.dashboard", 
    label: "Dashboard", 
    icon: HiOutlineHome,
    color: "text-blue-600"
  },
  {
    label: "E-commerce",
    icon: HiOutlineShoppingCart,
    color: "text-green-600",
    submenu: [
      { route: "admin.orders.index", label: "Commandes", icon: HiOutlineClipboardList },
      { route: "admin.payments.index", label: "Paiements", icon: HiOutlineCash },
      { route: "admin.payment-methods.index", label: "Méthodes de Paiement", icon: HiOutlineCog },
      { route: "admin.shippings.index", label: "Livraisons", icon: HiOutlineTruck },
    ]
  },
  {
    label: "Catalogue",
    icon: HiOutlineCollection,
    color: "text-purple-600",
    submenu: [
      { route: "admin.products.index", label: "Produits", icon: HiOutlineCube },
      { route: "admin.categories.index", label: "Catégories", icon: HiOutlineCollection },
      { route: "admin.subcategories.index", label: "Sous-catégories", icon: HiOutlineCollection },
      { route: "admin.colors.index", label: "Couleurs", icon: HiOutlineColorSwatch },
      { route: "admin.sizes.index", label: "Tailles", icon: HiOutlineChartBar },
    ]
  },
  {
    label: "Partenaires",
    icon: HiOutlineOfficeBuilding,
    color: "text-orange-600",
    submenu: [
      { route: "admin.suppliers.index", label: "Fournisseurs", icon: HiOutlineOfficeBuilding },
      { route: "admin.brands.index", label: "Marques", icon: HiOutlineCollection },
    ]
  },
  {
    label: "Communication",
    icon: HiOutlineBell,
    color: "text-indigo-600",
    submenu: [
      { route: "admin.contact-messages.index", label: "Messages de Contact", icon: HiOutlineMail },
      { route: "admin.newsletters.index", label: "Newsletter", icon: HiOutlineUsers },
    ]
  },
  { 
    route: "admin.customers.index", 
    label: "Clients", 
    icon: HiOutlineUserGroup,
    color: "text-teal-600"
  },
  { 
    route: "admin.users.index", 
    label: "Utilisateurs", 
    icon: HiOutlineUsers,
    color: "text-pink-600"
  },
];

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { url } = usePage();

  // Vérifier si une route est active
  const isRouteActive = (routeName) => {
    return url.startsWith(route(routeName));
  };

  // Vérifier si un sous-menu contient une route active
  const isSubmenuActive = (submenu) => {
    return submenu.some(item => isRouteActive(item.route));
  };

  // Gérer l'ouverture/fermeture des sous-menus
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  // Composant pour les éléments de navigation
  const NavigationItem = ({ item, index }) => {
    const Icon = item.icon;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = item.route ? isRouteActive(item.route) : isSubmenuActive(item.submenu || []);
    const isOpen = openSubmenu === index;

    if (hasSubmenu) {
      return (
        <div className="relative">
          <button
            onClick={() => toggleSubmenu(index)}
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }
              ${collapsed ? 'justify-center' : 'justify-between'}
            `}
          >
            <div className="flex items-center">
              <Icon className={`h-6 w-6 transition-colors ${isActive ? item.color : 'text-gray-500'}`} />
              {!collapsed && (
                <span className="ml-3 font-medium text-sm">{item.label}</span>
              )}
            </div>
            {!collapsed && (
              <HiChevronDown 
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              />
            )}
          </button>

          {/* Tooltip pour mode collapsed */}
          {collapsed && hoveredItem === index && (
            <div className="absolute left-16 top-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-50 shadow-lg">
              {item.label}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-gray-900"></div>
            </div>
          )}

          {/* Sous-menu */}
          {!collapsed && isOpen && (
            <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100">
              {item.submenu.map((subItem, subIndex) => {
                const SubIcon = subItem.icon;
                const isSubActive = isRouteActive(subItem.route);
                
                return (
                  <Link
                    key={subIndex}
                    href={route(subItem.route)}
                    className={`flex items-center px-6 py-2 rounded-lg transition-all duration-200 text-sm group
                      ${isSubActive 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <SubIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" />
                    {subItem.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Menu déroulant en mode collapsed */}
          {collapsed && hoveredItem === index && (
            <div className="absolute left-16 top-0 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 min-w-48">
              <div className="px-4 py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-900 text-sm">{item.label}</span>
              </div>
              {item.submenu.map((subItem, subIndex) => {
                const SubIcon = subItem.icon;
                const isSubActive = isRouteActive(subItem.route);
                
                return (
                  <Link
                    key={subIndex}
                    href={route(subItem.route)}
                    className={`flex items-center px-4 py-2 transition-colors text-sm
                      ${isSubActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <SubIcon className="h-4 w-4 mr-3 text-gray-400" />
                    {subItem.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Élément de navigation simple
    return (
      <div className="relative">
        <Link
          href={route(item.route)}
          onMouseEnter={() => setHoveredItem(index)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
            ${isActive 
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Icon className={`h-6 w-6 transition-colors ${isActive ? item.color : 'text-gray-500'}`} />
          {!collapsed && (
            <span className="ml-3 font-medium text-sm">{item.label}</span>
          )}
        </Link>

        {/* Tooltip pour mode collapsed */}
        {collapsed && hoveredItem === index && (
          <div className="absolute left-16 top-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-50 shadow-lg">
            {item.label}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-gray-900"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`h-screen bg-white border-r border-gray-200 shadow-lg flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-72"}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div className="ml-3">
              <h1 className="font-bold text-lg text-gray-900">EcomAdmin</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <HiOutlineMenuAlt3 className="h-5 w-5" />
          ) : (
            <HiOutlineX className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationLinks.map((item, index) => (
          <NavigationItem key={index} item={item} index={index} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <Link
          href="/logout"
          method="post"
          as="button"
          className={`w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors group
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <HiOutlineLogout className="h-6 w-6" />
          {!collapsed && (
            <span className="ml-3 font-medium text-sm">Déconnexion</span>
          )}
        </Link>
      </div>
    </aside>
  );
}
