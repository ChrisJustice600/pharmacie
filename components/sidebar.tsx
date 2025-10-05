"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  CreditCard,
  FileText,
  History,
  Menu,
  Package,
  Package2,
  Pill,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: BarChart3 },
  { name: "Caisse", href: "/pos", icon: CreditCard },
  { name: "Produits", href: "/products", icon: Pill },
  { name: "Produit + Stock", href: "/dualproduct", icon: PlusCircle },
  { name: "Stocks", href: "/stocks", icon: Package },
  { name: "Alertes", href: "/alerts", icon: AlertTriangle },
  { name: "Inventaire", href: "/inventory", icon: ClipboardList },
  { name: "Historique", href: "/movements", icon: History },
  { name: "Rapports", href: "/reports", icon: FileText },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-5 z-50 md:hidden bg-white p-2 rounded-md shadow-lg border hover:bg-gray-50 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-35 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-30 h-full w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-gray-200 px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <Package2 className="h-8 w-8 text-blue-600" />
              <span className="hidden lg:block">PharmaTrack</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-blue-700"
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 text-center">
              PharmaTrack v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
