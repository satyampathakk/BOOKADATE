import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="text-center shadow-lg">
                <Card.Body className="p-5">
                  <div className="mb-4">
                    <div style={{ fontSize: '4rem' }}>😵</div>
                  </div>
                  
                  <h2 className="text-gradient mb-3">Oops! Something went wrong</h2>
                  
                  <p className="text-muted mb-4">
                    We're sorry, but something unexpected happened. 
                    Don't worry, our team has been notified and we're working on it!
                  </p>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                    <Button 
                      variant="primary" 
                      onClick={this.handleReload}
                      className="me-md-2"
                    >
                      🔄 Try Again
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      onClick={this.handleGoHome}
                    >
                      🏠 Go Home
                    </Button>
                  </div>

                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 text-start">
                      <summary className="text-muted cursor-pointer">
                        <small>Show Error Details (Development Only)</small>
                      </summary>
                      <div className="mt-3 p-3 bg-light rounded">
                        <h6>Error:</h6>
                        <pre className="text-danger small">
                          {this.state.error && this.state.error.toString()}
                        </pre>
                        
                        <h6 className="mt-3">Stack Trace:</h6>
                        <pre className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </details>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;