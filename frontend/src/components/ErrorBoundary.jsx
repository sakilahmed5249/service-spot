import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // optional: send to telemetry here
    // window.Sentry?.captureException(error, { extra: info });
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="card-glass p-6 rounded-2xl shadow-2xl max-w-lg w-full">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
              !
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Something went wrong</h3>
              <p className="text-sm text-slate-300 mt-1">
                We ran into an error while loading this part of the app. Try again — if it persists, contact support.
              </p>

              <details className="mt-3 text-xs text-slate-400">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 max-h-40 overflow-auto text-xs text-rose-200 bg-black/10 p-2 rounded">
{String(this.state.error)}
                </pre>
              </details>

              <div className="mt-4 flex gap-3">
                <button onClick={this.reset} className="btn-primary inline-flex items-center gap-2" aria-label="Retry">
                  Retry
                </button>
                <button onClick={() => window.location.reload()} className="btn-secondary">
                  Hard reload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}