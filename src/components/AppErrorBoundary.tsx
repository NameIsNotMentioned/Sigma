import React from 'react';

type State = { error: Error | null };

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="route-error">
        <div className="route-error-card glass-panel">
          <span className="marketing-eyebrow">WORKSPACE ERROR</span>
          <h1>We couldn’t open this trip.</h1>
          <p>{this.state.error.message}</p>
          <button className="marketing-primary" onClick={() => window.location.hash = '#/dashboard'}>Back to trips</button>
        </div>
      </main>
    );
  }
}
