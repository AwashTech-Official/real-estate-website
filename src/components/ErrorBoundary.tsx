import React, { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Phone, MessageSquare } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  sectionName?: string;
  isAppLevel?: boolean;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    // Record to global error tracker for 8s watchdog / diagnostics
    if (typeof window !== 'undefined') {
      // @ts-expect-error - global diagnostics store
      window.__APPLET_LAST_ERROR__ = `${error.name}: ${error.message}\n${errorInfo.componentStack || ''}`;
    }
    console.error(`[ErrorBoundary] Caught in ${this.props.sectionName || 'App'}:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage =
        this.state.error?.message || 'An unexpected rendering error occurred.';
      const section = this.props.sectionName || 'This section';

      // 1. App-level fallback screen
      if (this.props.isAppLevel) {
        return (
          <div className="min-h-screen min-h-[100dvh] w-full bg-[#0C0D10] text-[#F5F3EF] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#141519] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-[#C8A35F]/15 border border-[#C8A35F]/30 flex items-center justify-center text-[#C8A35F] mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] tracking-tight">
                  Addis Luxury Realty
                </h1>
                <p className="text-xs text-[#C8A35F] uppercase font-mono tracking-wider mt-1">
                  አዲስ የቅንጦት ሪል እስቴት
                </p>
                <p className="text-sm text-[#B4B1A8] mt-3">
                  We encountered a display issue on this device. You can reach our team directly below:
                </p>
              </div>

              {/* Direct Contact CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href="tel:+251911234567"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C8A35F] text-[#0C0D10] font-semibold text-sm hover:bg-[#DEC07E] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call +251 91 123 4567</span>
                </a>
                <a
                  href="https://wa.me/251911234567?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20Addis%20Ababa%20real%20estate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-[#F5F3EF] border border-white/15 font-semibold text-sm hover:bg-white/20 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-2 text-xs text-[#B4B1A8] hover:text-[#F5F3EF] underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try reloading application</span>
                </button>
              </div>

              {/* Small diagnostic box for screenshotting */}
              <div className="p-3 rounded-lg bg-[#0C0D10] border border-white/5 text-left">
                <p className="text-[10px] text-[#B4B1A8] uppercase font-mono mb-1">
                  Diagnostics (for technical support):
                </p>
                <pre className="text-[11px] text-red-400/90 font-mono whitespace-pre-wrap break-all leading-tight max-h-28 overflow-y-auto">
                  {errorMessage}
                </pre>
              </div>
            </div>
          </div>
        );
      }

      // 2. Section-level fallback (replaces only the failed section, keeping the rest working)
      return (
        <div
          role="alert"
          className="w-full py-8 px-4 my-4 bg-[#141519] border border-white/10 rounded-xl text-center space-y-3 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 text-amber-400/90 text-xs font-mono uppercase">
            <AlertCircle className="w-4 h-4" />
            <span>{section} temporarily unavailable</span>
          </div>
          <p className="text-xs text-[#B4B1A8] max-w-md mx-auto">
            This section could not load on your device. The rest of the site remains fully accessible.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-[#F5F3EF] border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry section</span>
          </button>
          <p className="text-[10px] font-mono text-white/30 truncate max-w-sm mx-auto">
            {errorMessage}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
