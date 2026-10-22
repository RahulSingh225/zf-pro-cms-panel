import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    tabName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class TabErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("TabErrorBoundary caught an error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center my-6">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                        ⚠️
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                        Failed to load {this.props.tabName || "tab"} content
                    </h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                        {this.state.error?.message || "An unexpected error occurred while rendering this section."}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default TabErrorBoundary;
