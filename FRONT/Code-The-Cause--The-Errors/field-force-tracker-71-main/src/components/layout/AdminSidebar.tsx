import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  User,
  LogOut,
} from "lucide-react";

const mainNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

const managementNavigation = [
  { name: "Task Management", href: "/admin/tasks", icon: ClipboardList },
  { name: "Leave Management", href: "/admin/leave", icon: Calendar },
  { name: "Staff Directory", href: "/admin/staff", icon: Users },
];

const quickActionsNavigation = [
  { name: "Add Staff", href: "/admin/staff?action=add", icon: UserPlus },
  { name: "Assign Task", href: "/admin/tasks?action=create", icon: CheckCircle2 },
];

interface AdminSidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

export function AdminSidebar({ onClose, isCollapsed = false, toggleCollapse }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials =
    (user?.firstname?.[0] || "").toUpperCase() + (user?.lastname?.[0] || "").toUpperCase();

  const renderNavItem = (item: typeof mainNavigation[0]) => (
    <NavLink
      key={item.name}
      to={item.href}
      end={item.href === "/admin"}
      onClick={onClose}
    >
      {({ isActive }) => (
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={cn(
            "relative flex items-center rounded-md cursor-pointer overflow-hidden",
            isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2 text-sm font-medium",
            isActive
              ? "bg-sidebar-primary/15 text-sidebar-primary-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
          )}
        >
          {isActive && (
            <motion.span
              layoutId="active-indicator"
              className="absolute left-0 top-1 bottom-1 w-1 bg-sidebar-primary rounded"
            />
          )}
          <item.icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="truncate">{item.name}</span>}
        </motion.div>
      )}
    </NavLink>
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col relative">
        {toggleCollapse && (
          <Button
            onClick={toggleCollapse}
            className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar p-0 text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex items-center justify-center shadow-sm"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        )}

        {/* Logo */}
        <div className="flex h-20 items-center justify-center px-4 lg:px-6 border-b border-sidebar-border">
          <button
            type="button"
            onClick={() => toggleCollapse?.()}
            className="text-white text-3xl font-bold tracking-wide relative overflow-hidden group cursor-pointer"
          >
            {!isCollapsed ? (
              <div className="relative flex items-center justify-center overflow-hidden">
                <span className="block transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
                  THE_ERROR
                </span>
                <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0">
                  CLOSE
                </span>
              </div>
            ) : (
              <span className="block">TE</span>
            )}
          </button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden h-8 w-8 text-sidebar-foreground/70"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <div className="px-2 pt-1 pb-2 text-xs font-semibold tracking-wider text-muted-foreground/70">
              MAIN
            </div>
          )}
          {mainNavigation.map(renderNavItem)}

          {!isCollapsed && (
            <div className="px-2 pt-4 pb-2 text-xs font-semibold tracking-wider text-muted-foreground/70">
              MANAGEMENT
            </div>
          )}
          {managementNavigation.map(renderNavItem)}

          {!isCollapsed && (
            <div className="px-2 pt-4 pb-2 text-xs font-semibold tracking-wider text-muted-foreground/70">
              QUICK ACTIONS
            </div>
          )}
          {quickActionsNavigation.map(renderNavItem)}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-3 py-3 border-t border-sidebar-border">
          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "justify-start gap-3"
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-white font-semibold">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user ? `${user.firstname} ${user.lastname}` : "User"}
                </p>
                <p className="text-xs text-white/70 truncate">{user?.role || "Guest"}</p>
              </div>
            )}
          </div>
          <div className={cn("mt-2 flex gap-2", isCollapsed ? "justify-center" : "justify-start")}>
            {isCollapsed ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="gap-2 text-white"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="gap-2 text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
