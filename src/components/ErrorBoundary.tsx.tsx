import React from "react";
export class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() { if (this.state.hasError) return <div style={{padding:20}}>Page had error, refresh. {String(this.state.error)}</div>; return this.props.children; }
}