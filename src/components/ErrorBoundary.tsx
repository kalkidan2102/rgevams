import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#071322] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-[#0E2238] border border-cyan-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold text-2xl">
                ⚠️
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight font-display">
                  R-GEVAMS Portal Recovery
                </h1>
                <p className="text-xs text-slate-300 font-mono">
                  Ethiopian Space Science &amp; Geospatial Institute
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto space-y-1">
              <div className="font-bold text-slate-400">Diagnostic message:</div>
              <div>{this.state.error?.message || "An unexpected rendering event occurred."}</div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="bg-[#0085C8] hover:bg-[#0073AD] text-white font-mono font-bold text-xs uppercase px-5 py-3 rounded-xl cursor-pointer transition-all shadow-md"
              >
                Reload Portal
              </button>
              <button
                onClick={this.handleReset}
                className="bg-white/10 hover:bg-white/20 text-slate-200 font-mono font-bold text-xs uppercase px-5 py-3 rounded-xl cursor-pointer transition-all border border-white/20"
              >
                Reset Cache &amp; Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
