"use client";

import React, { ReactNode, ReactElement } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component for catching React errors
 * Prevents entire app from crashing on component errors
 */
export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render(): ReactElement {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback as ReactElement;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-md w-full text-center">
                        <div className="mb-4">
                            <div className="text-4xl mb-3">⚠️</div>
                            <h1 className="text-xl font-bold text-zinc-100 mb-2">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-zinc-400 text-sm mb-4">
                                An unexpected error occurred while rendering this component.
                            </p>
                        </div>

                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="mt-4 text-left bg-zinc-800 rounded p-3">
                                <summary className="cursor-pointer text-zinc-300 text-sm font-mono font-bold">
                                    Error Details (Dev Mode)
                                </summary>
                                <pre className="mt-2 text-xs text-zinc-400 overflow-auto max-h-48 whitespace-pre-wrap word-wrap">
                                    {this.state.error.toString()}
                                    {"\n"}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children as ReactElement;
    }
}

/**
 * Wrapper component for conditional error boundary wrapping
 * Useful for wrapping specific sections without wrapping entire app
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode,
): React.ComponentType<P> {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`;

    return WrappedComponent;
}
