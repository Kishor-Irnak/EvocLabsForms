import React, { useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Pipeline } from "./pages/Pipeline";
import { Companion } from "./pages/Companion";
import { ThemeProvider } from "./components/ThemeProvider";
import { Menu, Bell, Star, ChevronDown } from "lucide-react";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <HashRouter>
        <div className="flex min-h-screen bg-[#f2f3f7] font-sans">
          <Sidebar
            onOpenNewLead={() => {}}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-30 flex items-center px-4 justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              >
                <Menu size={20} />
              </button>
              <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                EL
              </div>
              <span className="font-bold text-gray-900 text-base">
                Evoc Labs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <Bell size={18} />
              </button>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                EL
              </div>
            </div>
          </div>

          <main className="flex-1 w-full lg:ml-[220px] min-h-screen pt-14 lg:pt-0 transition-all duration-300">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/companion" element={<Companion />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
