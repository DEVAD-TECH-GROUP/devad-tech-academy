import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-bg p-8 text-center">
          <div className="text-5xl mb-4">💥</div>
          <h2 className="dsp text-xl font-bold text-text mb-2">Something went wrong</h2>
          <p className="text-muted text-sm mb-6">Please refresh the page</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
