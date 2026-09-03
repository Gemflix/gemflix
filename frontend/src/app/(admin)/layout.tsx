"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Fijo */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Contenido Principal con Offset del Sidebar */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar />
        <main className="flex-1 p-8">
          <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
          {children}
        </main>
      </div>
    </div>
  );
}
