import React from "react";

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error: unknown }

/* Use this global error boundary to ensure the user never sees a blank
   screen from a rendering error. As of React 18, we still need to use 
   the old class components for error boundaries. */
export class GlobalErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: unknown) {
        return { hasError: true, error };
    }

    componentDidCatch(error: unknown, info: unknown) {
        console.error("Global error boundary caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center">
                    <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
                    <p className="opacity-70">Try refreshing the page.</p>

                    {/* TEMPORARY DEBUG OUTPUT */}
                    <pre className="text-left text-sm whitespace-pre-wrap opacity-80">
                        {String(this.state.error)}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}
