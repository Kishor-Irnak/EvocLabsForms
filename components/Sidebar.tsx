import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  UserRound,
  MessageSquare,
  Mail,
  Zap,
  BarChart2,
  Link2,
  Megaphone,
  Layers,
  HelpCircle,
  MessageCircle,
  Settings,
  Unlock,
  ChevronRight,
  Search,
  ChevronLeft,
  X,
} from "lucide-react";
import { cn } from "./ui-primitives";

interface SidebarProps {
  onOpenNewLead: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NavItem = ({
  to,
  icon: Icon,
  label,
  badge,
  color,
  onClick,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number | string;
  color?: string;
  onClick?: () => void;
}) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative",
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
      )
    }
  >
    {({ isActive }) => (
      <>
        {/* Active indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-500 rounded-r-full" />
        )}
        <Icon
          size={18}
          className={cn(
            "shrink-0 transition-colors",
            isActive
              ? "text-gray-800"
              : "text-gray-400 group-hover:text-gray-600",
          )}
        />
        <span className="flex-1 truncate">{label}</span>
        {badge !== undefined && (
          <span
            className={cn(
              "ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full",
              typeof badge === "number" && badge > 0
                ? "bg-gray-100 text-gray-600"
                : "bg-gray-100 text-gray-500",
            )}
          >
            {badge}
          </span>
        )}
        {color && (
          <span
            className="w-2 h-2 rounded-full shrink-0 ml-auto"
            style={{ backgroundColor: color }}
          />
        )}
      </>
    )}
  </NavLink>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const closeMobile = () => {
    if (window.innerWidth < 1024) onClose();
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
          "fixed inset-y-0 left-0 z-40 w-[220px] flex flex-col border-r border-gray-100 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
              EL
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900 leading-none">
                Evoc Labs
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Free Plan</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={16} />
          </button>
          <button className="hidden lg:flex p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50">
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 border-none outline-none flex-1 w-full"
            />
            <span className="text-[10px] font-medium text-gray-400 bg-gray-200 rounded px-1 py-0.5 shrink-0 hidden sm:block">
              ⌘K
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {/* MAIN MENU */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Main Menu
            </p>
            <div className="space-y-0.5">
              <NavItem
                to="/"
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={closeMobile}
              />
              <NavItem
                to="/pipeline"
                icon={ShoppingBag}
                label="Product"
                onClick={closeMobile}
              />
              <NavItem
                to="/orders"
                icon={ClipboardList}
                label="Order"
                onClick={closeMobile}
              />
              <NavItem
                to="/customers"
                icon={UserRound}
                label="Customer"
                onClick={closeMobile}
              />
              <NavItem
                to="/companion"
                icon={MessageSquare}
                label="Message"
                badge={33}
                onClick={closeMobile}
              />
            </div>
          </div>

          {/* TOOLS */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Tools
            </p>
            <div className="space-y-0.5">
              <NavItem
                to="/email"
                icon={Mail}
                label="Email"
                onClick={closeMobile}
              />
              <NavItem
                to="/automation"
                icon={Zap}
                label="Automation"
                onClick={closeMobile}
              />
              <NavItem
                to="/analytics"
                icon={BarChart2}
                label="Analytics"
                onClick={closeMobile}
              />
              <NavItem
                to="/integration"
                icon={Link2}
                label="Integration"
                onClick={closeMobile}
              />
            </div>
          </div>

          {/* WORKSPACE */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Workspace
            </p>
            <div className="space-y-0.5">
              <NavItem
                to="/campaign"
                icon={Megaphone}
                label="Campaign"
                badge={5}
                color="#3b82f6"
                onClick={closeMobile}
              />
              <NavItem
                to="/product-plan"
                icon={Layers}
                label="Product Plan"
                badge={4}
                color="#f97316"
                onClick={closeMobile}
              />
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="px-2 py-2 space-y-0.5 border-t border-gray-100">
          <NavLink
            to="/help"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <HelpCircle size={17} className="text-gray-400 shrink-0" />
            Help center
          </NavLink>
          <NavLink
            to="/feedback"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <MessageCircle size={17} className="text-gray-400 shrink-0" />
            Feedback
          </NavLink>
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <Settings size={17} className="text-gray-400 shrink-0" />
            Settings
          </NavLink>
        </div>

        {/* Upgrade CTA */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-orange-50 rounded-xl px-3 py-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
              <Unlock size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 leading-tight">
                Upgrade &amp; unlock
              </p>
              <p className="text-xs text-gray-500 leading-tight">
                all features
              </p>
            </div>
            <ChevronRight size={14} className="text-orange-400 shrink-0" />
          </div>
        </div>
      </div>
    </>
  );
};
