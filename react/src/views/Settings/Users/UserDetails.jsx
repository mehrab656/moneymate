import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import MainLoader from '../../../components/loader/MainLoader.jsx';
import { useGetSingleUserDataQuery } from '../../../api/slices/userSlice.js';

export default function UserDetails({ userId = null, data = null }) {
  const shouldFetch = Boolean(userId) && !data;
  const { data: userResp, isFetching } = useGetSingleUserDataQuery(
    { id: userId },
    { skip: !shouldFetch }
  );

  const user = data || userResp?.data || {};

  return (
    <div>
      <MainLoader loaderVisible={isFetching} />
      <Container>
        <Row>
          <Col xs={12} md={4} className="text-center">
            <Image src={user.avatar} roundedCircle style={{ height: 140, width: 140 }} />
            <div className="mt-2">
              {user.active !== undefined && (
                <Badge bg={String(user.active).toLowerCase() === 'active' ? 'success' : 'secondary'}>
                  {user.active}
                </Badge>
              )}
            </div>
          </Col>
          <Col xs={12} md={8}>
            <h5 className="mb-2">{user.first_name} {user.last_name}</h5>
            <p className="mb-1"><b>Username:</b> {user.username || user.user_name}</p>
            <p className="mb-1"><b>Email:</b> {user.email}</p>
            <p className="mb-1"><b>Phone:</b> {user.phone}</p>
            <p className="mb-1"><b>Emergency Contact:</b> {user.emergency_contact}</p>
            <p className="mb-1"><b>DOB:</b> {user.dob}</p>
            <p className="mb-1"><b>Gender:</b> {user.gender}</p>
            <p className="mb-1"><b>Role:</b> {user.role}</p>
            {user.profile && (
              <Card className="mt-3">
                <Card.Header>Profile</Card.Header>
                <Card.Body>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{user.profile}</pre>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}