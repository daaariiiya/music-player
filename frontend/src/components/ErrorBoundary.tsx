import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: '2rem' }}>
            <h2>Something went wrong.</h2>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>{this.state.error.message}</pre>
            <button onClick={this.reset}>Retry</button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
