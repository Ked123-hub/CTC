import React, { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Removing the static import to handle it dynamically

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

// Landing Page Components
import Navbar from "@/pages/Landing/Navbar";
import LandingPage from "@/pages/Landing/LandingPage";
import Marquee from "@/pages/Landing/Marquee";
import Featured from "@/pages/Landing/Featured";
import Cards from "@/pages/Landing/Cards";
import ReadyEyes from "@/pages/Landing/ReadyEyes";
import Footer from "@/pages/Landing/Footer";
import CursorEffect from "@/pages/Landing/CursorEffect";

// Auth / App Pages
import Index from "./pages/Index";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Volunteer Pages
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerLeave from "./pages/volunteer/VolunteerLeave";
import VolunteerTasks from "./pages/volunteer/VolunteerTasks";
import VolunteerReports from "./pages/volunteer/VolunteerReports";
import StoryGenerator from "./pages/volunteer/StoryGenerator";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminLeave from "./pages/admin/AdminLeave";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminLocations from "./pages/admin/AdminLocations";

const queryClient = new QueryClient();

const App = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const initLocomotiveScroll = async () => {
      // Adding delay to ensure DOM is fully rendered before initializing Locomotive Scroll
      setTimeout(async () => {
        if (scrollRef.current) {
          try {
            const { default: LocomotiveScroll } = await import("locomotive-scroll");
            // Initialize with just the container element, avoiding problematic options
            const scroll = new LocomotiveScroll(scrollRef.current);
            (window as any).__locoScroll = scroll;
          } catch (err) {
            console.error("Locomotive Scroll initialization error:", err);
            // Fallback to native scrolling if the library fails to load
          }
        }
      }, 100); // Small delay to ensure DOM is ready
    };
    
    initLocomotiveScroll();
    
    return () => {
      if ((window as any).__locoScroll) {
        try {
          (window as any).__locoScroll.destroy?.();
        } catch(e) {
          console.warn("Error destroying Locomotive Scroll:", e);
        }
        delete (window as any).__locoScroll;
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <Routes>
                {/* Landing Page */}
                <Route
                  path="/"
                  element={
                    <div
                      ref={scrollRef}
                      data-scroll-container
                      className="w-full min-h-screen bg-white text-black font-['nmontreal']"
                    >
                      <CursorEffect />
                      <Navbar />
                      <LandingPage />
                      <Marquee />
                      <Featured />
                      <Cards />
                      <ReadyEyes />
                      <Footer />
                    </div>
                  }
                />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/register" element={<Signup />} />

                {/* Manager Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                      <Index />
                    </ProtectedRoute>
                  }
                />

                {/* Protected App Pages */}
                <Route
                  path="/attendance"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                      <Attendance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leave"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                      <Leave />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                      <Tasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                      <Staff />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tasks"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AdminTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/leave"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AdminLeave />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/staff"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AdminStaff />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/locations"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AdminLocations />
                    </ProtectedRoute>
                  }
                />

                {/* Volunteer Routes */}
                <Route
                  path="/volunteer"
                  element={
                    <ProtectedRoute allowedRoles={["WORKER"]}>
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/leave"
                  element={
                    <ProtectedRoute allowedRoles={["WORKER"]}>
                      <VolunteerLeave />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/tasks"
                  element={
                    <ProtectedRoute allowedRoles={["WORKER"]}>
                      <VolunteerTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/reports"
                  element={
                    <ProtectedRoute allowedRoles={["WORKER"]}>
                      <VolunteerReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/story-generator"
                  element={
                    <ProtectedRoute allowedRoles={["WORKER"]}>
                      <StoryGenerator />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;