import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { 
  HiOutlineHome, 
  HiOutlineClipboardList, 
  HiOutlineUserGroup, 
  HiOutlineCog, 
  HiOutlineChartBar, 
  HiOutlineLogout, 
  HiOutlineTruck, 
  HiOutlineUsers,
  HiOutlineBell,
  HiOutlineMenuAlt3,
  HiOutlineX,
  HiOutlineUserCircle,
  HiOutlineShoppingCart,
  HiOutlineColorSwatch,
  HiOutlineCube,
  HiOutlineCollection,
  HiOutlineCash,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';
import { FiChevronDown } from 'react-icons/fi';
import defaultUser from '../../assets/front/imgs/default-user.png';

const navigationLinks = [
  { 
    route: "admin.dashboard", 
    label: "Dashboard", 
    icon: HiOutlineHome,
    color: "text-amber-600"
  },
  {
    label: "E-commerce",
    icon: HiOutlineShoppingCart,
    color: "text-blue-600",
    submenu: [
      { route: "admin.orders.index", label: "Commandes", icon: HiOutlineClipboardList },
      { route: "admin.payments.index", label: "Paiements", icon: HiOutlineCash },
      { route: "admin.shippings.index", label: "Livraisons", icon: HiOutlineTruck },
    ]
  },
  {
    label: "Catalogue",
    icon: HiOutlineCollection,
    color: "text-green-600",
    submenu: [
      { route: "admin.products.list", label: "Produits", icon: HiOutlineCube },
      { route: "admin.categories.list", label: "Catégories", icon: HiOutlineCollection },
      { route: "admin.subcategories.list", label: "Sous-catégories", icon: HiOutlineCollection },
      { route: "admin.colors.list", label: "Couleurs", icon: HiOutlineColorSwatch },
      { route: "admin.sizes.list", label: "Tailles", icon: HiOutlineChartBar },
    ]
  },
  {
    label: "Partenaires",
    icon: HiOutlineOfficeBuilding,
    color: "text-purple-600",
    submenu: [
      { route: "admin.suppliers.list", label: "Fournisseurs", icon: HiOutlineOfficeBuilding },
      { route: "admin.brands.list", label: "Marques", icon: HiOutlineCollection },
    ]
  },
  { 
    route: "admin.customers.index", 
    label: "Clients", 
    icon: HiOutlineUserGroup,
    color: "text-indigo-600"
  },
  { 
    route: "admin.users.index", 
    label: "Utilisateurs", 
    icon: HiOutlineUsers,
    color: "text-pink-600"
  },
];

function ModernSidebar({ collapsed, setCollapsed, openSubmenu, setOpenSubmenu }) {
  return (
    <aside className={`h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-72'} border-r border-slate-700/50`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              ENMA Admin
            </h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          {collapsed ? <HiOutlineMenuAlt3 size={20} /> : <HiOutlineX size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationLinks.map((item, index) => (
          <div key={index}>
            {item.submenu ? (
              <div>
                <button
                  onClick={() => setOpenSubmenu(openSubmenu === index ? null : index)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:bg-slate-700/50 group ${
                    openSubmenu === index ? 'bg-slate-700/30' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`${item.color} group-hover:scale-110 transition-transform`} size={20} />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <FiChevronDown className={`transition-transform ${openSubmenu === index ? 'rotate-180' : ''}`} />
                  )}
                </button>
                {openSubmenu === index && !collapsed && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.route}
                        href={route(subItem.route)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors text-slate-300 hover:text-white"
                      >
                        <subItem.icon size={16} />
                        <span className="text-sm">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={route(item.route)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group"
              >
                <item.icon className={`${item.color} group-hover:scale-110 transition-transform`} size={20} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700/50">
        <Link
          href={route('logout')}
          method="post"
          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 group"
        >
          <HiOutlineLogout className="group-hover:scale-110 transition-transform" size={20} />
          {!collapsed && <span className="font-medium">Déconnexion</span>}
        </Link>
      </div>
    </aside>
  );
}

function ModernHeader({ user, sidebarCollapsed }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Tableau de Bord
          </h1>
          <p className="text-sm text-slate-500">
            Bienvenue dans votre espace d'administration
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200">
          <HiOutlineBell size={20} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200">
          <HiOutlineCog size={20} />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 p-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-xl border border-amber-200/50 transition-all duration-200"
          >
            <img
              src={defaultUser}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-700">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-500">Administrateur</p>
            </div>
            <FiChevronDown className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden z-50">
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-100">
                <p className="font-medium text-slate-800">{user?.name || 'Admin'}</p>
                <p className="text-sm text-slate-600">{user?.email || 'admin@example.com'}</p>
              </div>
              <Link
                href={route('profile.show')}
                className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <HiOutlineUserCircle className="text-amber-600" size={18} />
                <span className="text-slate-700">Mon Profil</span>
              </Link>
              <Link
                href="#"
                className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <HiOutlineCog className="text-slate-600" size={18} />
                <span className="text-slate-700">Paramètres</span>
              </Link>
              <div className="border-t border-slate-100 mt-1">
                <Link
                  href={route('logout')}
                  method="post"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                >
                  <HiOutlineLogout size={18} />
                  <span>Déconnexion</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ title, children }) {
  const { auth } = usePage().props;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  return (
    <>
      <Head title={title} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
        <ModernSidebar 
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          openSubmenu={openSubmenu}
          setOpenSubmenu={setOpenSubmenu}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <ModernHeader user={auth?.user} sidebarCollapsed={sidebarCollapsed} />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 min-h-[calc(100vh-200px)]">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </>
  );
}