import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Header } from "./Header";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          isCollapsed={collapsed}
          toggleCollapse={() => setCollapsed((p) => !p)}
        />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <AdminSidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CONTENT WRAPPER (THIS IS THE FIX) */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          collapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-semibold truncate">{title}</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block sticky top-0 z-30">
          <Header
            title={title}
            subtitle={subtitle}
            collapsed={collapsed}
          />
        </div>

        {/* Page Content */}
        <main className="mt-16 lg:mt-20 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
