import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import axiosClient from '../../../axios-client.js';
import MainLoader from '../../../components/loader/MainLoader.jsx';
import { notification } from '../../../components/ToastNotification.jsx';
import { useSidebarActions } from '../../../hooks/useSidebarActions.js';
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetSingleUserDataQuery,
} from '../../../api/slices/userSlice.js';

const defaultUserData = {
  id: '',
  slug: '',
  first_name: '',
  last_name: '',
  user_name: '',
  username: '',
  email: '',
  phone: '',
  emergency_contact: '',
  dob: '',
  gender: '',
  avatar: '',
  role: '',
  active: '',
  profile: '',
  attachment: '',
};

export default function UserFormSidebar({ userId = null, data = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [roleLists, setRoleLists] = useState([]);
  const [element, setElement] = useState(defaultUserData);
  const { closeSidebar } = useSidebarActions();

  // Fetch single user when editing by id (if no data passed)
  const shouldFetch = Boolean(userId) && !data;
  const { data: userResp, isFetching } = useGetSingleUserDataQuery(
    { id: userId },
    { skip: !shouldFetch }
  );

  // Initialize element from provided data or fetched data
  useEffect(() => {
    if (data) {
      setElement({
        ...defaultUserData,
        ...data,
        user_name: data.user_name || data.username || '',
        avatar: data.avatar || '',
      });
    } else if (userResp?.data) {
      const u = userResp.data;
      setElement({
        ...defaultUserData,
        ...u,
        user_name: u.user_name || u.username || '',
        avatar: u.avatar || '',
      });
    }
  }, [data, userResp]);

  // Load roles
  useEffect(() => {
    axiosClient
      .get('/roles-by-company')
      .then(({ data }) => setRoleLists(data.data || []))
      .catch(() => {});
  }, []);

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append('first_name', element.first_name || '');
    formData.append('last_name', element.last_name || '');
    formData.append('user_name', element.user_name || '');
    formData.append('email', element.email || '');
    formData.append('phone', element.phone || '');
    formData.append('emergency_contact', element.emergency_contact || '');
    formData.append('dob', element.dob || '');
    formData.append('gender', element.gender || '');
    formData.append('profile', element.profile || '');
    formData.append('role', element.role || '');
    formData.append('active', element.active || '');
    if (element.attachment) {
      formData.append('attachment', element.attachment);
    }

    try {
      let resp;
      if (element.slug) {
        resp = await updateUser({ slug: element.slug, formData }).unwrap();
      } else {
        resp = await createUser({ formData }).unwrap();
      }
      notification('success', resp?.message, resp?.description);
      if (typeof onSuccess === 'function') onSuccess();
      closeSidebar();
    } catch (err) {
      const status = err?.status;
      if (status === 406) {
        const errorData = err.errorData;
        notification('error', errorData?.message, errorData?.description);
      } else if (status === 422) {
        setErrors(err.errorData?.errors || {});
        notification('error', err?.message);
      } else {
        notification('error', err?.message || 'An error occurred', err?.description || 'Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setElement({ ...element, avatar: URL.createObjectURL(file), attachment: file });
  };

  return (
    <div>
      <MainLoader loaderVisible={loading || isFetching} />
      <Container>
        <Form onSubmit={submit}>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="first_name">
                <Form.Label><b>First Name</b></Form.Label>
                <Form.Control
                  type="text"
                  value={element.first_name || ''}
                  className={'border-primary'}
                  onChange={(e) => setElement({ ...element, first_name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="last_name">
                <Form.Label><b>Last Name</b></Form.Label>
                <Form.Control
                  type="text"
                  value={element.last_name || ''}
                  className={'border-primary'}
                  onChange={(e) => setElement({ ...element, last_name: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="user_name">
                <Form.Label><b>User Name</b></Form.Label>
                <Form.Control
                  type="text"
                  value={element.user_name || ''}
                  className={'border-primary'}
                  onChange={(e) => setElement({ ...element, user_name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label><b>Email</b></Form.Label>
                <Form.Control
                  type="email"
                  value={element.email || ''}
                  className={'border-primary'}
                  onChange={(e) => setElement({ ...element, email: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="phone">
                <Form.Label><b>Phone</b></Form.Label>
                <Form.Control
                  type="text"
                  value={element.phone || ''}
                  className={'border-primary'}
                  onChange={(e) => setElement({ ...element, phone: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="emergency_contact">
                <Form.Label><b>Emergency Contact</b></Form.Label>
                <Form.Control
                  type="text"
                  value={element.emergency_contact || ''}
                  className={'border-primary'}
                  onChange={(e) => setElement({ ...element, emergency_contact: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col xs={12} md={4}>
              <Form.Group className="mb-3" controlId="dob">
                <Form.Label><b>Date of Birth</b></Form.Label>
                <Form.Control
                  type="date"
                  value={element.dob || ''}
                  className={'border-primary'}
                  onChange={(e) => setElement({ ...element, dob: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group controlId="gender">
                <Form.Label><b>Gender</b></Form.Label>
                <Form.Select
                  value={element.gender || ''}
                  aria-label="Gender"
                  className={'border-primary'}
                  onChange={(e) => setElement({ ...element, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group controlId="role">
                <Form.Label><b>Roles</b></Form.Label>
                <Form.Select
                  value={element.role || ''}
                  aria-label="Roles"
                  className={'border-primary'}
                  onChange={(e) => setElement({ ...element, role: e.target.value })}
                >
                  <option value="">Set user role</option>
                  {roleLists.length > 0 ? (
                    roleLists.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role?.toUpperCase?.() || role.role}
                      </option>
                    ))
                  ) : (
                    <option value="">User Role</option>
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col xs={12} md={12}>
              <Form.Group controlId="avatar" style={{ textAlign: 'center' }}>
                {element.avatar && (
                  <Image src={element.avatar} style={{ height: '150px', width: '150px' }} roundedCircle />
                )}
                <Form.Control type="file" className={'border-primary'} onChange={handleImageChange} />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2 mt-3">
            <Button variant="secondary" onClick={() => closeSidebar()}>Close</Button>
            <Button variant="primary" type="submit">{element.slug ? 'Update' : 'Create'}</Button>
          </div>
        </Form>
      </Container>
    </div>
  );
}