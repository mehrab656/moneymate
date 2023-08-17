import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error, info) {
        // You can log the error or perform any other error handling tasks here
        console.error(error);
        this.setState({ hasError: true });
    }

    render() {
        if (this.state.hasError) {
            // Render a fallback UI or custom error message
            return <h1>Oops! Something went wrong.</h1>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
