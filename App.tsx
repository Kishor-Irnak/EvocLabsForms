import React, { useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Pipeline } from "./pages/Pipeline";
import { Companion } from "./pages/Companion";
import { Login } from "./pages/Login";
import { ThemeProvider } from "./components/ThemeProvider";
import { Menu } from "lucide-react";
import { AuthProvider } from "./src/context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Outlet } from "react-router-dom";

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar
        onOpenNewLead={() => {}}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-30 flex items-center px-4 gap-3 shadow-sm">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center shrink-0">
          <img
            src="/evoclabs_mini_logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-bold text-gray-900">Evoc Labs CRM</span>
      </div>

      <main className="flex-1 w-full lg:ml-60 min-h-screen pt-14 lg:pt-0 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/companion" element={<Companion />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
