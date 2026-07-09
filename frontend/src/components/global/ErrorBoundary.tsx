import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error intercepted by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md w-full border rounded-2xl bg-card p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="bg-destructive/10 p-4 rounded-full mb-6 text-destructive">
              <AlertOctagon className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-2">Something went wrong</h1>
            <p className="text-muted-foreground text-sm mb-6">
              An unexpected error occurred in the user interface. We apologize for the inconvenience.
            </p>
            {this.state.error?.message && (
              <div className="w-full bg-muted p-4 rounded-lg text-left text-xs font-mono mb-6 overflow-auto max-h-32 border">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-4 w-full">
              <Button onClick={this.handleReset} className="flex-1 gap-2" variant="default">
                <RotateCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} className="flex-1 gap-2" variant="outline">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
