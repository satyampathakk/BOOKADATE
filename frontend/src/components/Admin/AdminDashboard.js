import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { adminAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const AdminDashboard = () => {
  const { user } = useUser();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    approvedUsers: 0,
    rejectedUsers: 0
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getRegistrations();
      const registrationsData = response.data || [];
      
      setRegistrations(registrationsData);
      
      // Calculate statistics
      const pending = registrationsData.filter(r => r.registration_status === 'pending').length;
      const approved = registrationsData.filter(r => r.registration_status === 'approved').length;
      const rejected = registrationsData.filter(r => r.registration_status === 'rejected').length;
      
      setStats({
        totalUsers: registrationsData.length,
        pendingApprovals: pending,
        approvedUsers: approved,
        rejectedUsers: rejected
      });
    } catch (err) {
      setError('Failed to load admin data');
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await adminAPI.approveRegistration(userId);
      await loadAdminData(); // Refresh data
      alert('User approved successfully!');
    } catch (err) {
      console.error('Approval error:', err);
      alert('Failed to approve user');
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      await adminAPI.rejectRegistration(selectedUser.id, { reason: rejectReason });
      await loadAdminData(); // Refresh data
      setShowModal(false);
      setSelectedUser(null);
      setRejectReason('');
      alert('User rejected successfully!');
    } catch (err) {
      console.error('Rejection error:', err);
      alert('Failed to reject user');
    }
  };

  const openRejectModal = (userReg) => {
    setSelectedUser(userReg);
    setShowModal(true);
  };

  const closeRejectModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setRejectReason('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading admin dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h5>⚠️ Admin Dashboard Error</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadAdminData}>
            🔄 Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4 fade-in">
      {/* Header */}
      <Row className="mb-5">
        <Col>
          <div className="text-center">
            <h1 className="display-5 fw-bold text-gradient mb-3">
              👨‍💼 Admin Dashboard
            </h1>
            <p className="lead text-muted">
              Manage user registrations and platform operations
            </p>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-5 g-4">
        <Col lg={3} md={6}>
          <div className="stat-card">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="stat-card">
            <div className="stat-number">{stats.pendingApprovals}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="stat-card">
            <div className="stat-number">{stats.approvedUsers}</div>
            <div className="stat-label">Approved Users</div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="stat-card">
            <div className="stat-number">{stats.rejectedUsers}</div>
            <div className="stat-label">Rejected Users</div>
          </div>
        </Col>
      </Row>

      {/* User Registrations Table */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">👥 User Registrations</h5>
                <Button variant="outline-primary" size="sm" onClick={loadAdminData}>
                  🔄 Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {registrations.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Gender</th>
                        <th>Age</th>
                        <th>Status</th>
                        <th>Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((registration) => {
                        const age = registration.dob 
                          ? new Date().getFullYear() - new Date(registration.dob).getFullYear()
                          : 'N/A';
                        
                        return (
                          <tr key={registration.id}>
                            <td>
                              <div>
                                <strong>{registration.name}</strong>
                                {registration.bio && (
                                  <div>
                                    <small className="text-muted">
                                      {registration.bio.substring(0, 50)}
                                      {registration.bio.length > 50 ? '...' : ''}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>{registration.email}</td>
                            <td>{registration.phone}</td>
                            <td>
                              <Badge bg="light" text="dark">
                                {registration.gender}
                              </Badge>
                            </td>
                            <td>{age}</td>
                            <td>{getStatusBadge(registration.registration_status)}</td>
                            <td>
                              <small className="text-muted">
                                {registration.created_at 
                                  ? new Date(registration.created_at).toLocaleDateString()
                                  : 'N/A'
                                }
                              </small>
                            </td>
                            <td>
                              {registration.registration_status === 'pending' && (
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleApprove(registration.id)}
                                    title="Approve User"
                                  >
                                    ✅
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => openRejectModal(registration)}
                                    title="Reject User"
                                  >
                                    ❌
                                  </Button>
                                </div>
                              )}
                              {registration.registration_status === 'rejected' && (
                                <small className="text-danger">
                                  Reason: {registration.rejection_reason || 'No reason provided'}
                                </small>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3" style={{ fontSize: '3rem' }}>👥</div>
                  <h6 className="text-muted">No user registrations found</h6>
                  <p className="text-muted small">
                    User registrations will appear here when people sign up.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Rejection Modal */}
      <Modal show={showModal} onHide={closeRejectModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>❌ Reject User Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="mb-3">
              <p>
                <strong>User:</strong> {selectedUser.name} ({selectedUser.email})
              </p>
            </div>
          )}
          <Form.Group>
            <Form.Label>Reason for Rejection *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a clear reason for rejecting this registration..."
              required
            />
            <Form.Text className="text-muted">
              This reason will be stored and may be shared with the user.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRejectModal}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleReject}
            disabled={!rejectReason.trim()}
          >
            Reject User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Quick Actions */}
      <Row className="mt-5">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center p-4">
              <h5 className="fw-bold mb-3">🛠️ Quick Actions</h5>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button variant="outline-primary" onClick={loadAdminData}>
                  🔄 Refresh Data
                </Button>
                <Button variant="outline-info" disabled>
                  📊 Export Reports
                </Button>
                <Button variant="outline-warning" disabled>
                  ⚙️ Platform Settings
                </Button>
              </div>
              <small className="text-muted d-block mt-3">
                Additional admin features coming soon!
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;