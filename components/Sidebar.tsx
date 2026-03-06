import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Kanban,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "./ui-primitives";
import { auth } from "../src/lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

interface SidebarProps {
  onOpenNewLead: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pipeline", icon: Kanban, label: "Pipeline" },
  { to: "/companion", icon: Users, label: "Companion Leads" },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const closeMobile = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutDialog(false);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 flex flex-col bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black overflow-hidden flex items-center justify-center shrink-0 p-1">
              <img
                src="evoclabs_mini_logo.png"
                alt="Evoc Labs"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">
                Evoc Labs
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">CRM Dashboard</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Main Menu
          </p>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={closeMobile}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-500 rounded-r-full" />
                  )}
                  <Icon
                    size={17}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-gray-800"
                        : "text-gray-400 group-hover:text-gray-600",
                    )}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
          <a
            href="mailto:support@evoclabs.in"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <HelpCircle size={17} className="text-gray-400 shrink-0" />
            Help Center
          </a>
          <NavLink
            to="/settings"
            onClick={closeMobile}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <Settings size={17} className="text-gray-400 shrink-0" />
            Settings
          </NavLink>
        </div>

        {/* User Info */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-black overflow-hidden flex items-center justify-center shrink-0 border border-gray-800 p-1.5">
              <img
                src="evoclabs_mini_logo.png"
                alt="Admin"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                Admin User
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currentUser?.email || "admin@evoclabs.com"}
              </p>
            </div>
            <LogOut
              size={15}
              className="text-gray-400 group-hover:text-gray-900 transition-colors shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
