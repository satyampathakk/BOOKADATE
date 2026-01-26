import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { adminAPI } from '../../services/api';

const AdminTest = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authResult, setAuthResult] = useState(null);

  const testAdminAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Testing admin authentication...');
      const response = await adminAPI.authenticate();
      console.log('Admin Auth Response:', response.data);
      setAuthResult(response.data);
      setSuccess('Admin authentication successful!');
    } catch (err) {
      console.error('Admin Auth Error:', err);
      setError(`Auth Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAdminAPI = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Testing admin registrations API...');
      const response = await adminAPI.getRegistrations();
      console.log('Admin API Response:', response.data);
      setRegistrations(response.data || []);
      setSuccess(`Successfully loaded ${response.data?.length || 0} registrations`);
    } catch (err) {
      console.error('Admin API Error:', err);
      setError(`API Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>🧪 Admin API Test</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <div className="d-flex gap-2 mb-3">
                <Button 
                  variant="info" 
                  onClick={testAdminAuth}
                  disabled={loading}
                >
                  {loading ? 'Testing...' : 'Test Admin Auth'}
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={testAdminAPI}
                  disabled={loading}
                >
                  {loading ? 'Testing...' : 'Test Admin API'}
                </Button>
              </div>
              
              {authResult && (
                <div className="mt-4">
                  <h5>Authentication Result:</h5>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(authResult, null, 2)}
                  </pre>
                </div>
              )}
              
              {registrations.length > 0 && (
                <div className="mt-4">
                  <h5>Registrations Found ({registrations.length}):</h5>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((reg) => (
                          <tr key={reg.id}>
                            <td>{reg.id}</td>
                            <td>{reg.name}</td>
                            <td>{reg.email}</td>
                            <td>
                              <span className={`badge ${
                                reg.registration_status === 'approved' ? 'bg-success' :
                                reg.registration_status === 'pending' ? 'bg-warning' :
                                'bg-danger'
                              }`}>
                                {reg.registration_status}
                              </span>
                            </td>
                            <td>{reg.created_at ? new Date(reg.created_at).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminTest;