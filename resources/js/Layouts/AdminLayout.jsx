import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import DashboardSidebar from '../Components/DashboardSidebar';
import DashboardHeader from '../Components/DashboardHeader';

export default function AdminLayout({ title, children }) {
  const { auth } = usePage().props;

  return (
    <>
      <Head title={title} />
      <div className="min-h-screen bg-[#f7f3ee] flex">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={auth.user} />
          <main className="flex-1 px-6 py-4">
            {children}
          </main>
        </div>
      </div>
      <style>{`
        .sidebar-label {
          transition: opacity .25s cubic-bezier(.4,0,.2,1), max-width .25s cubic-bezier(.4,0,.2,1);
        }
        .animate-fade-in { animation: fade-in .25s ease; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: none;} }
      `}</style>
    </>
  );
}