import * as React from 'react';
import { Alert } from 'react-bootstrap';


export interface ErrorBoundaryProps {
    children?: any
}

export interface ErrorBoundaryState {
    hasError: boolean,
    errorInfo: string
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: any) {
        super(props)
        this.state = {
            hasError: false,
            errorInfo: ''
        };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.log(errorInfo.componentStack)
        this.setState({
            errorInfo: errorInfo.componentStack
        })
    }

    render() {
        if (this.state.hasError) {
          return (<>
          <h5>{'Ups! Something went wrong :('}</h5><br/>
          <Alert color='danger'>{this.state.errorInfo}</Alert>
            </>);
        }
    
        return this.props.children; 
      }
    


}