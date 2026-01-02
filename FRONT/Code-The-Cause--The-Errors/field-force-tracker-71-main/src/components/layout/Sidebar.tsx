import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  FileText,
  Clock,
  X,
  User,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const sections = [
  {
    title: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Attendance", href: "/attendance", icon: Clock },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { name: "Leave Management", href: "/leave", icon: Calendar },
      { name: "Tasks", href: "/tasks", icon: ClipboardList },
      { name: "Staff Directory", href: "/staff", icon: Users },
      { name: "Reports", href: "/reports", icon: FileText },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export function Sidebar({ collapsed = false, onToggle, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const user = {
    firstname: "Admin",
    lastname: "User",
    role: "Administrator",
  };

  const initials = `${user.firstname[0]}${user.lastname[0]}`;

  const logout = () => {
    localStorage.clear();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-sidebar-border px-4">
          <button
            onClick={onToggle}
            className="text-white text-3xl font-bold relative overflow-hidden group mx-auto"
          >
            {!collapsed ? (
              <>
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                  THE_ERROR
                </span>
                <span className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  CLOSE
                </span>
              </>
            ) : (
              <span>TE</span>
            )}
          </button>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden absolute right-4 text-sidebar-foreground/70"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-2 mb-2 text-xs font-semibold tracking-wider text-sidebar-foreground/50">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink key={item.name} to={item.href} end={item.href === "/"}>
                    {({ isActive }) => (
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                          isActive
                            ? "bg-sidebar-primary/15 text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.span
                            layoutId="active-indicator"
                            className="absolute left-0 top-1 bottom-1 w-1 bg-sidebar-primary rounded"
                          />
                        )}

                        <item.icon className="h-5 w-5 shrink-0" />

                        {!collapsed && <span>{item.name}</span>}
                      </motion.div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstname} {user.lastname}
                </p>
                <p className="text-xs text-white/70 truncate">{user.role}</p>
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 text-white w-full justify-start"
            >
              <User className="h-4 w-4" />
              {!collapsed && "Profile"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="gap-2 text-white w-full justify-start"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && "Sign Out"}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
