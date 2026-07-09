import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "@/pages/routes/router.tsx";
import { AuthProvider } from "@/hooks/AuthProvider";
import { ThemeProvider } from "@/components/provider/theme";
import ErrorBoundary from "@/components/global/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>
  </ThemeProvider>,
);
