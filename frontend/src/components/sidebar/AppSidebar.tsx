"use client";

import {
  School,
  Users,
  LayoutDashboard,
  CircleUserRound,
  type LucideIcon,
  LogOut,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/types";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { useMemo } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToogle } from "./ThemeToogle";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  roles?: UserRole[];
  items?: {
    title: string;
    url: string;
    roles?: UserRole[];
  }[];
}

export const sidebardata = {
  teams: [
    {
      name: "YabaTech",
      logo: School,
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      roles: ["admin", "teacher", "student", "parent"],
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          roles: ["admin", "teacher", "student", "parent"],
        },
      ],
    },
    {
      title: "My Profile",
      url: "/settings/profile",
      icon: CircleUserRound,
      roles: ["admin", "teacher", "student", "parent"],
      items: [
        {
          title: "Account Settings",
          url: "/settings/profile",
          roles: ["admin", "teacher", "student", "parent"],
        },
      ],
    },
    {
      title: "Academics",
      url: "#",
      icon: School,
      roles: ["admin", "teacher", "student"],
      items: [
        {
          title: "Classes",
          url: "/classes",
          roles: ["admin"],
        },
        {
          title: "Courses",
          url: "/courses",
          roles: ["admin"],
        },
        {
          title: "Course Registration",
          url: "/course-registration",
          roles: ["student"],
        },
        {
          title: "Results",
          url: "/results",
          roles: ["admin", "teacher", "student"],
        },
      ],
    },
    {
      title: "People",
      url: "#",
      icon: Users,
      roles: ["admin"],
      items: [
        { title: "Students", url: "/users/students", roles: ["admin"] },
        {
          title: "Teachers",
          url: "/users/teachers",
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Setup",
      url: "#",
      icon: School,
      roles: ["admin"],
      items: [
        { title: "Academic Years", url: "/settings/academic-years" },
        { title: "Architecture", url: "/architecture" },
      ],
    },
  ] as NavItem[],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, year, setUser } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: "",
  };

  const userRole = (user?.role || "student") as UserRole;

  const filteredNav = useMemo(() => {
    return sidebardata.navMain
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .map((item) => {
        const visibleItems =
          item.items?.filter(
            (subItem) => !subItem.roles || subItem.roles.includes(userRole),
          ) || [];
        const isChildActive = item.items?.some((sub) => sub.url === pathname);
        const isMainActive = item.url === pathname;
        return {
          ...item,
          isActive: isMainActive || isChildActive,
          items: visibleItems.map((subItem) => ({
            ...subItem,
            isActive: subItem.url === pathname,
          })),
        };
      })
      .filter((item) => item.url !== "#" || (item.items && item.items.length > 0));
  }, [pathname, userRole]);

  const logout = async () => {
    try {
      await api.post("/users/logout").finally(() => {
        setUser(null);
        navigate("/login");
        toast.success("Logged out successfully");
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebardata.teams} yearName={year?.name ?? ""} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter>
        <div
          className={cn(
            "gap-2",
            isCollapsed ? "flex-row space-y-2" : "flex justify-between",
          )}
        >
          <SidebarMenuItem title="Logout">
            <Button onClick={logout} variant={"ghost"} size="icon-sm">
              <LogOut />
            </Button>
          </SidebarMenuItem>
          <ThemeToogle />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

