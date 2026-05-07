import React from "react";

interface Props { children: React.ReactNode }
interface State { hasError: boolean }

/* Use this global error boundary to ensure the user never sees a blank
   screen from a rendering error. As of React 18, we still need to use 
   the old class components for error boundaries. */
export class GlobalErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
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
                </div>
            );
        }
        return this.props.children;
    }
}
