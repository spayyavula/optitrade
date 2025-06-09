import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary: Error caught by getDerivedStateFromError:', error);
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('=== ERROR BOUNDARY CAUGHT ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('================================');
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    console.log('ErrorBoundary: Reloading page');
    window.location.reload();
  };

  handleGoHome = () => {
    console.log('ErrorBoundary: Going home');
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      console.log('ErrorBoundary: Rendering error UI');
      
      return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center mb-6">
              <AlertTriangle className="text-error-400 mr-3\" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-error-300">Something went wrong</h1>
                <p className="text-neutral-400 mt-1">The application encountered an unexpected error</p>
              </div>
            </div>

            <div className="bg-neutral-750 border border-neutral-600 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-neutral-200 mb-2">Error Details:</h3>
              <p className="text-error-300 text-sm mb-2">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-neutral-400 text-sm hover:text-neutral-300">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-neutral-500 overflow-auto max-h-40 bg-neutral-800 p-2 rounded">
                  {this.state.error?.stack}
                  {this.state.errorInfo && '\n\nComponent Stack:'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </div>

            <div className="bg-warning-900/30 border border-warning-700 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-warning-300 mb-2">What you can do:</h3>
              <ul className="text-warning-200 text-sm space-y-1">
                <li>• Try refreshing the page</li>
                <li>• Check your internet connection</li>
                <li>• Clear your browser cache and cookies</li>
                <li>• Try using a different browser</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="btn-primary flex items-center flex-1"
              >
                <RefreshCw size={18} className="mr-2" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-ghost flex items-center flex-1"
              >
                <Home size={18} className="mr-2" />
                Go Home
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-neutral-500 text-sm">
                Error ID: {Date.now().toString(36)} | Time: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;