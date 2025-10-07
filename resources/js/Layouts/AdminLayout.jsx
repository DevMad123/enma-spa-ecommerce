import React, { useState } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import DashboardSidebar from '@/Components/DashboardSidebar';
import DashboardHeader from '@/Components/DashboardHeader';
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

// Configuration des notifications pour le header
const mockNotifications = [
  {
    title: "Nouvelle commande",
    message: "Commande #1234 en attente de traitement",
    time: "Il y a 5 minutes",
    read: false
  },
  {
    title: "Message de contact",
    message: "Nouveau message de John Doe",
    time: "Il y a 10 minutes", 
    read: false
  },
  {
    title: "Stock faible",
    message: "5 produits en rupture de stock",
    time: "Il y a 1 heure",
    read: true
  }
];

// Fonction helper pour obtenir le titre de la page
function getPageTitle(url) {
  if (!url) return 'Administration';
  
  const path = url.split('/').pop();
  
  switch (path) {
    case 'dashboard':
      return 'Tableau de Bord';
    case 'contact-messages':
      return 'Messages de Contact';
    case 'newsletters':
      return 'Newsletter';
    case 'products':
      return 'Produits';
    case 'orders':
      return 'Commandes';
    case 'customers':
      return 'Clients';
    default:
      return 'Administration';
  }
}

export default function AdminLayout({ title, children }) {
  const { props } = usePage();
  const { auth } = props;
  const { url } = usePage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = title || getPageTitle(url);

  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <>
      <Head title={pageTitle} />
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <DashboardSidebar 
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCollapse={setSidebarCollapsed}
          onMobileClose={() => setMobileOpen(false)}
        />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <DashboardHeader 
            user={{
              name: auth?.user?.name || 'Admin',
              email: auth?.user?.email || 'admin@example.com',
              avatar: auth?.user?.avatar_url || auth?.user?.default_avatar_url,
              role: 'Administrateur'
            }}
            title={pageTitle}
            notifications={mockNotifications}
            onSidebarToggle={handleSidebarToggle}
            showSearch={true}
          />
          
          {/* Main content area */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </div>
    </>
  );
}