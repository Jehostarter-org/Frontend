"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { NavLink } from "@/components/reuseables/navLink";
import { useAuth } from "@/components/contexts/auth-context";
import { navigationItems, categories } from "./dashboard-stats";
import { SidebarHeader } from "@/components/reuseables/sideHeader";
import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import LocationSection from "@/components/dashboard/location-section";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export default function DashboardShell({ children, onClose }: DashboardLayoutProps) {
  const { logout, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarToggle = useCallback((isOpen: boolean) => { setSidebarOpen(isOpen); }, []);

  const handleLogout = async () => {
    try {
      logout();
      router.push('/auth/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => handleSidebarToggle(false)} aria-hidden="true" />
      )}

      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-full", sidebarOpen ? "translate-x-0" : "-translate-x-full")} >
        <SidebarHeader onClose={() => handleSidebarToggle(false)} />

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 custom-scrollbar">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                isActive={pathname === item.href}
                onClick={() => handleSidebarToggle(false)}
              />
            ))}
          </nav>

          <div className="px-1">
            <Button asChild className="w-full bg-[#2C4E5B] hover:bg-[#23404a] text-white shadow-md transition-all active:scale-[0.98]">
              <Link href="/dashboard/add-products?tab=list">
                My Product
              </Link>
            </Button>
          </div>

          <div className="px-1">
            <LocationSection />
          </div>

          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Categories
            </h3>
            <nav className="space-y-1">
              {categories.map((category) => (
                <NavLink
                  key={category.href}
                  {...category}
                  isActive={pathname === category.href}
                  onClick={() => handleSidebarToggle(false)}
                />
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/30">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors group" >
            <LogOut className="w-4 h-4 mr-3 group-hover:text-red-600 transition-colors" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}