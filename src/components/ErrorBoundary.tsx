import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-pink-100 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold text-pink-600 mb-4">Oops! Something went wrong.</h1>
          <p className="text-gray-700 mb-4">The app encountered a problem. Please try refreshing.</p>
          <pre className="bg-white p-4 rounded-xl text-left text-xs text-red-500 overflow-auto max-w-full mb-6">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="bg-pink-600 text-white px-6 py-2 rounded-xl font-bold"
          >
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
