import { useAuth } from "@/hooks/AuthProvider";
import { Navigate, Outlet, useLocation } from "react-router";
import { Loader2 } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";

const PrivateRoutes = () => {
  const { loading, user, year } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!year) {
    if (user.role === "admin") {
      if (location.pathname !== "/settings/academic-years") {
        return <Navigate to="/settings/academic-years" replace />;
      }
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E8F5EE] bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4B5563]">
              Dashboard Menu
            </p>
            <p className="text-sm font-bold text-[#111111]">
              {year?.name || "Academic Session"}
            </p>
          </div>
          <SidebarTrigger className="h-10 w-10 rounded-full border border-[#E8F5EE] bg-[#E8F5EE] text-[#111111] hover:bg-[#FFF9CC]" />
        </div>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PrivateRoutes;
