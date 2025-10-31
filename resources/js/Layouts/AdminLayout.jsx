import React, { useState, useEffect } from 'react';
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
  const { auth, appSettings, flash } = props;
  const { url } = usePage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Gérer la détection de la taille d'écran
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Vérifier la taille initiale
    checkScreenSize();

    // Écouter les changements de taille
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const pageTitle = title || getPageTitle(url);
  const appName = appSettings?.app_name || 'ENMA SPA';
  const fullTitle = `${pageTitle} - ${appName}`;

  const handleSidebarToggle = () => {
    if (!isDesktop) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Calculer la marge gauche
  const getMainContentStyle = () => {
    if (!isDesktop) return { marginLeft: '0' };
    return {
      marginLeft: sidebarCollapsed ? '5rem' : '18rem'
    };
  };

  return (
    <>
      <Head title={fullTitle} />
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <DashboardSidebar 
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCollapse={setSidebarCollapsed}
          onMobileClose={() => setMobileOpen(false)}
        />
        
        {/* Main content */}
        <div 
          className="flex flex-col min-h-screen transition-all duration-300"
          style={getMainContentStyle()}
        >
          {/* Header */}
          <DashboardHeader 
            user={{
              id: auth?.user?.id || 0,
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
              {flash?.success && (
                <div className="mb-4 rounded border border-green-200 bg-green-50 text-green-800 px-4 py-3">
                  {flash.success}
                </div>
              )}
              {flash?.error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-800 px-4 py-3">
                  {flash.error}
                </div>
              )}
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
