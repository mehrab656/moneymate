import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import axiosClient from '../../../axios-client.js';
import MainLoader from '../../../components/loader/MainLoader.jsx';
import { notification } from '../../../components/ToastNotification.jsx';
import { useSidebarActions } from '../../../components/GlobalSidebar';
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetSingleUserDataQuery,
} from '../../../api/slices/userSlice.js';
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle, createSelectStyles, createDateInputStyle } from "../../../styles/formThemeStyles.js";
import Select from 'react-select';
// removed react-datepicker; using native date input with themed styles

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

export default forwardRef(function UserFormSidebar({ userId = null, data = null, onSuccess, formId: formIdProp = null, hideInternalFooter = false }, ref) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [roleLists, setRoleLists] = useState([]);
  const [element, setElement] = useState(defaultUserData);
  const { closeSidebar } = useSidebarActions();
  const formId = formIdProp || "user-form-sidebar-form";
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const inputFontSize = "0.875rem";
  const selectStyles = createSelectStyles(theme, inputFontSize);
  const dateInputStyle = createDateInputStyle(theme, inputFontSize);

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

  const submit = async (e, stay = false) => {
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
      if (stay && !element.slug) {
        setElement(defaultUserData);
      } else {
        closeSidebar();
      }
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

  // Expose imperative methods for sticky footer actions
  useImperativeHandle(ref, () => ({
    save: () => {
      submit({ preventDefault: () => {} }, true);
    },
    saveAndExit: () => {
      submit({ preventDefault: () => {} }, false);
    },
  }));

  return (
    <div>
      <MainLoader loaderVisible={loading || isFetching} />
      <Container>
        <Form id={formId} onSubmit={(e) => submit(e, true)}>
          <Row>
            <Col xs={12} md={6}>
              <InputGroup className={errors.first_name ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="user_first_name" style={inputGroupTextStyle}>First Name</InputGroup.Text>
                <Form.Control
                  aria-describedby="user_first_name"
                  name="first_name"
                  type="text"
                  value={element.first_name || ''}
                  onChange={(e) => setElement({ ...element, first_name: e.target.value })}
                />
              </InputGroup>
              {errors.first_name && (<p className="error-message">{errors.first_name[0]}</p>)}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.last_name ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="user_last_name" style={inputGroupTextStyle}>Last Name</InputGroup.Text>
                <Form.Control
                  aria-describedby="user_last_name"
                  name="last_name"
                  type="text"
                  value={element.last_name || ''}
                  onChange={(e) => setElement({ ...element, last_name: e.target.value })}
                />
              </InputGroup>
              {errors.last_name && (<p className="error-message">{errors.last_name[0]}</p>)}
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <InputGroup className={errors.user_name ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="user_username" style={inputGroupTextStyle}>User Name</InputGroup.Text>
                <Form.Control
                  aria-describedby="user_username"
                  name="user_name"
                  type="text"
                  value={element.user_name || ''}
                  onChange={(e) => setElement({ ...element, user_name: e.target.value })}
                />
              </InputGroup>
              {errors.user_name && (<p className="error-message">{errors.user_name[0]}</p>)}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.email ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="user_email" style={inputGroupTextStyle}>Email</InputGroup.Text>
                <Form.Control
                  aria-describedby="user_email"
                  name="email"
                  type="email"
                  value={element.email || ''}
                  onChange={(e) => setElement({ ...element, email: e.target.value })}
                />
              </InputGroup>
              {errors.email && (<p className="error-message">{errors.email[0]}</p>)}
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <InputGroup className={errors.phone ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="user_phone" style={inputGroupTextStyle}>Phone</InputGroup.Text>
                <Form.Control
                  aria-describedby="user_phone"
                  name="phone"
                  type="text"
                  value={element.phone || ''}
                  onChange={(e) => setElement({ ...element, phone: e.target.value })}
                />
              </InputGroup>
              {errors.phone && (<p className="error-message">{errors.phone[0]}</p>)}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.emergency_contact ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="user_emergency_contact" style={inputGroupTextStyle}>Emergency Contact</InputGroup.Text>
                <Form.Control
                  aria-describedby="user_emergency_contact"
                  name="emergency_contact"
                  type="text"
                  value={element.emergency_contact || ''}
                  onChange={(e) => setElement({ ...element, emergency_contact: e.target.value })}
                />
              </InputGroup>
              {errors.emergency_contact && (<p className="error-message">{errors.emergency_contact[0]}</p>)}
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={12}>
              <InputGroup className={errors.gender ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="user_gender" style={inputGroupTextStyle}>Gender</InputGroup.Text>
                <div className="flex-grow-1">
                  <Select
                    classNamePrefix="select"
                    styles={selectStyles}
                    isSearchable={false}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    aria-describedby="user_gender"
                    name="gender"
                    placeholder="Select Gender"
                    value={
                      [{ value: "male", label: "Male" }, { value: "female", label: "Female" }]
                        .find(opt => opt.value === (element.gender || "")) || null
                    }
                    onChange={(opt) => setElement({ ...element, gender: opt?.value || "" })}
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ]}
                  />
                </div>
              </InputGroup>
              {errors.gender && (<p className="error-message">{errors.gender[0]}</p>)}
            </Col>
            <Col xs={12} md={12}>
              <InputGroup className={errors.role ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="user_role" style={inputGroupTextStyle}>Role</InputGroup.Text>
                <div className="flex-grow-1">
                  <Select
                    classNamePrefix="select"
                    styles={selectStyles}
                    isSearchable={false}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    aria-describedby="user_role"
                    name="role"
                    placeholder="Set user role"
                    value={
                      roleLists?.length
                        ? roleLists
                            .map((r) => ({ value: r.id, label: r.role?.toUpperCase?.() || r.role }))
                            .find((opt) => opt.value === (element.role || "")) || null
                        : null
                    }
                    onChange={(opt) => setElement({ ...element, role: opt?.value || "" })}
                    options={
                      roleLists.map((r) => ({ value: r.id, label: r.role?.toUpperCase?.() || r.role }))
                    }
                  />
                </div>
              </InputGroup>
              {errors.role && (<p className="error-message">{errors.role[0]}</p>)}
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <InputGroup className={errors.dob ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="user_dob" style={inputGroupTextStyle}>Date of Birth</InputGroup.Text>
                <Form.Control
                  aria-describedby="user_dob"
                  name="dob"
                  type="date"
                  value={element.dob || ''}
                  onChange={(e) => setElement({ ...element, dob: e.target.value })}
                  style={dateInputStyle}
                />
              </InputGroup>
              {errors.dob && (<p className="error-message">{errors.dob[0]}</p>)}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className="mb-3" size="sm">
                <Form.Control
                  aria-label="Add Attachment"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  placeholder="Add Attachment"
                  name="avatar"
                  className="file-input-secondary"
                  style={{
                    backgroundColor: theme.palette.background.paper,
                    '--cms-secondary-bg': theme.palette.secondary.main,
                    '--cms-secondary-contrast': theme.palette.getContrastText(theme.palette.secondary.main),
                  }}
                />
              </InputGroup>
              {element.avatar && (
                <div style={{ textAlign: 'center' }}>
                  <Image src={element.avatar} style={{ height: '150px', width: '150px' }} roundedCircle />
                </div>
              )}
            </Col>
          </Row>

          {!hideInternalFooter && (
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-secondary" type="button" onClick={() => closeSidebar()}>Close</button>
              <button className="btn btn-primary" type="submit">{element.slug ? 'Update' : 'Create'}</button>
            </div>
          )}
        </Form>
      </Container>
    </div>
  );
});
