import { useAuth } from "@/hooks/AuthProvider";
import { Navigate, Outlet } from "react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4 text-destructive">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          Your current account role ({user.role}) does not have permission to view this section of the system.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => window.location.href = "/dashboard"}>
            Dashboard Home
          </Button>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
