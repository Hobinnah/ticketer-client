{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class HooksErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('🚨 Error Boundary Caught:', error);
    
    // Check if it's a hooks violation
    if (error.message.includes('fewer hooks than expected') || 
        error.message.includes('more hooks than expected') ||
        error.message.includes('hook call')) {
      console.error('🎣 HOOKS VIOLATION DETECTED!');
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
      
      // Log current component state
      console.log('🔍 Debug Info at Error Time:');
      console.log('- URL:', window.location.href);
      console.log('- User Agent:', navigator.userAgent);
      console.log('- Timestamp:', new Date().toISOString());
    }

    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '20px',
          border: '2px solid #ff4444',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          color: '#cc0000',
          fontFamily: 'monospace',
          margin: '20px'
        }}>
          <h2>🚨 React Error Detected</h2>
          <details>
            <summary>Error Details (Click to expand)</summary>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: '12px', 
              backgroundColor: '#f0f0f0',
              padding: '10px',
              marginTop: '10px',
              borderRadius: '4px'
            }}>
              <strong>Error:</strong> {this.state.error?.message}
              {'\n\n'}
              <strong>Stack:</strong> {this.state.error?.stack}
              {'\n\n'}
              <strong>Component Stack:</strong> {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}