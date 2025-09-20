import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import {Form} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axiosClient from "../../../axios-client.js";
import {notification} from "../../../components/ToastNotification.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";

const defaultEmployee = {
    first_name: '',
    last_name: '',
    user_name: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    emergency_contact: '',
    joining_date: '',
    role_id: '',
    position: '',
    basic_salary: '',
    accommodation_cost: '',
    profile_picture: '',
    id_copy: ''
}
export default function CreateOrUpdateModal({show, closeFunc}) {
    let {id} = useParams();
    const [employee, setEmployee] = useState(defaultEmployee);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [roleList,setRoleList]=useState([]);

    const handleFileInputChange = (event, name) => {
        const file = event.target.files[0];
        setEmployee((prevState) => {
            if (name === 'id_copy') {
                return {...prevState, id_copy: file};
            } else {
                return {...prevState, profile_picture: file};
            }
        });
    };

    useEffect(() => {
        setLoading(true);
        axiosClient
            .get("/roles-by-company")
            .then(({data}) => {
                setLoading(false);
                setRoleList(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);
    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        let formData = new FormData();
        formData.append('first_name', employee.first_name);
        formData.append('last_name', employee.last_name);
        formData.append('user_name', employee.user_name);
        formData.append('dob', employee.dob);
        formData.append('gender', employee.gender);
        formData.append('email', employee.email);
        formData.append('phone', employee.phone);
        formData.append('emergency_contact', employee.emergency_contact);
        formData.append('joining_date', employee.joining_date);
        formData.append('position', employee.position);
        formData.append('role_id', employee.role_id);
        formData.append('basic_salary', employee.basic_salary);
        formData.append('accommodation_cost', employee.accommodation_cost);
        formData.append('profile_picture', employee.profile_picture);
        formData.append('id_copy', employee.id_copy);

        const url = id ? `/employee/${id}` : `/employee/add`;
        axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(({data}) => {
            notification('success', data?.message, data?.description);
            setEmployee(defaultEmployee);
            setErrors({});
            closeFunc();
            setLoading(false);
            // location.reload('/all-employees');

        }).catch((err) => {
            if (err.response) {
                const error = err.response.data
                notification('error', error?.message, error.description);
                setErrors(error.errors);

            }

            setLoading(false);
        });
    }
    return (
        <>
            <MainLoader loaderVisible={loading}/>

            <Modal
                show={show}
                onHide={closeFunc}
                backdrop="static"
                keyboard={false}
                size={'lg'}
                // fullscreen={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{"Add new Employee"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Form>
                            <Row>
                                <Col xs={12} md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="first_name">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control type="text" value={employee.first_name}
                                                      name={'first_name'}
                                                      onChange={(e) => {
                                                          setEmployee({...employee, first_name: e.target.value});
                                                      }}
                                        />
                                        {errors?.first_name &&
                                            <small className="error-message mt-2">{errors?.first_name[0]}</small>}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="last_name">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control type="text" rows={3} value={employee.last_name}
                                                      name={'last_name'}
                                                      onChange={(e) => {
                                                          setEmployee({...employee, last_name: e.target.value});
                                                      }}
                                        />
                                        {errors?.last_name &&
                                            <small className="error-message mt-2">{errors?.last_name[0]}</small>}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="user_name">
                                        <Form.Label>User Name</Form.Label>
                                        <Form.Control type="text" rows={3} value={employee.user_name}
                                                      name={'user_name'}
                                                      onChange={(e) => {
                                                          setEmployee({...employee, user_name: e.target.value});
                                                      }}
                                        />
                                        {errors?.user_name &&
                                            <small className="error-message mt-2">{errors?.user_name[0]}</small>}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="email">
                                        <Form.Label>E-mail</Form.Label>
                                        <Form.Control type="email" rows={3} value={employee.email}
                                                      name={'email'}
                                                      onChange={(e) => {
                                                          setEmployee({...employee, email: e.target.value});
                                                      }}
                                        />
                                        {errors?.email &&
                                            <small className="error-message mt-2">{errors?.email[0]}</small>}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="dob">
                                        <Form.Label>Date Of Birth</Form.Label>
                                        <Form.Control type="date" rows={3} value={employee.dob}
                                                      name={'dob'}
                                                      onChange={(e) => {
                                                          setEmployee({...employee, dob: e.target.value});
                                                      }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="gender">
                                        <Form.Label>Gender</Form.Label>
                                        <Form.Select
                                            aria-label="gender" onChange={(e) => {
                                            setEmployee({...employee, gender: e.target.value});
                                        }}>
                                            <option defaultValue>Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr className={'border-danger'}/>
                            <Row>
                                <Col xs={12} md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="phone">
                                        <Form.Label>Phone</Form.Label>
                                        <Form.Control type="text" rows={3} value={employee.phone}
                                                      name={'phone'}
                                                      onChange={(e) => {
                                                          setEmployee({...employee, phone: e.target.value});
                                                      }}
                                        />
                                        {errors?.phone &&
                                            <small className="error-message mt-2">{errors?.phone[0]}</small>}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="emergency_contact">
                                        <Form.Label>Emergency Contact</Form.Label>
                                        <Form.Control type="text" rows={3} value={employee.emergency_contact}
                                                      name={'emergency_contact'}
                                                      autoFocus
                                                      className={'border-none'}
                                                      onChange={(e) => {
                                                          setEmployee({...employee, emergency_contact: e.target.value});
                                                      }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <hr className={'border-danger'}/>
                            <Row>
                                <Col xs={12} md={12} lg={12} sm={12}>
                                    <Form.Group className="mb-3" controlId="role_id">
                                        <Form.Label>Employee Role</Form.Label>
                                        <Form.Select
                                            aria-label="Task Type" onChange={(e) => {
                                            setEmployee({...employee, role_id: e.target.value});
                                        }}>
                                            <option defaultValue>Select Role</option>
                                            {roleList.length > 0 ? roleList.map((role) => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.role}
                                                    </option>
                                                )) :
                                                (<option defaultValue>{"Select Role"}</option>)
                                            }
                                        </Form.Select>
                                        {errors?.role_id &&
                                            <small className="error-message mt-2">{errors?.role_id[0]}</small>}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <hr className={'border-danger'}/>
                            <Row>
                                <Col xs={12} md={3} lg={3} sm={12}>
                                    <Form.Group className="mb-3" controlId="joining_date">
                                        <Form.Label>Joining Date</Form.Label>
                                        <Form.Control type="date"
                                                      value={employee.joining_date} onChange={(e) => {
                                            setEmployee({...employee, joining_date: e.target.value});
                                        }}/>
                                        {errors?.joining_date &&
                                            <small className="error-message mt-2">{errors?.joining_date[0]}</small>}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3} lg={3} sm={12}>
                                    <Form.Group className="mb-3" controlId="position">
                                        <Form.Label>Designation</Form.Label>
                                        <Form.Select
                                            aria-label="Task Type" onChange={(e) => {
                                            setEmployee({...employee, position: e.target.value});
                                        }}>
                                            <option defaultValue>Select Designation</option>
                                            <option value="supervisor">Supervisor</option>
                                            <option value="cleaner">Cleaner</option>
                                            <option value="driver">Driver</option>
                                            <option value="hr">HR</option>
                                            <option value="intern">Intern</option>
                                            <option value="accountant">Accountant</option>
                                            <option value="investor">Investor</option>
                                            <option value="others">Others</option>
                                        </Form.Select>
                                        {errors?.position &&
                                            <small className="error-message mt-2">{errors?.position[0]}</small>}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3} lg={3} sm={12}>
                                    <Form.Group className="mb-3" controlId="basic_salary">
                                        <Form.Label> Basic Salary</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="i.g: 50 AED"
                                            autoFocus
                                            onChange={(e) => {
                                                setEmployee({...employee, basic_salary: e.target.value});
                                            }}
                                        />
                                        {errors?.basic_salary &&
                                            <small className="error-message mt-2">{errors?.basic_salary[0]}</small>}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3} lg={3} sm={12}>
                                    <Form.Group className="mb-3" controlId="accommodation_cost">
                                        <Form.Label> Accommodation Cost</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="i.g: 1500 AED"
                                            autoFocus
                                            onChange={(e) => {
                                                setEmployee({...employee, accommodation_cost: e.target.value});
                                            }}
                                        />
                                        {errors?.accommodation_cost &&
                                            <small className="error-message mt-2">{errors?.accommodation_cost[0]}</small>}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <hr className={'border-danger'}/>
                            <Row>
                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3" controlId="profile_picture">
                                        <Form.Label> Profile Picture</Form.Label>
                                        <Form.Control
                                            type="file"
                                            onChange={(e) => handleFileInputChange(e, 'profile_picture')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3" controlId="id_copy">
                                        <Form.Label> Identity copy</Form.Label>
                                        <Form.Control
                                            type="file"
                                            onChange={(e) => handleFileInputChange(e, 'id_copy')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={closeFunc}>Close</Button>
                    <Button variant="primary" onClick={(e) => submit(e)}>Add Employee</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}