import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {Form} from "react-bootstrap";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import axiosClient from "../../axios-client.js";
import {notification} from "../../components/ToastNotification.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import Image from "react-bootstrap/Image";
import {useCreateUserMutation,useUpdateUserMutation} from "../../api/slices/userSlice.js"
export default function CreateOrUpdateModal({handelCloseModal, element, setElement}) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({
        task_status: '',
        comment: ''
    });
    const [roleLists, setRoleLists]=useState([]);

    const slug = element.slug
    useEffect(() => {
        axiosClient.get('/roles-by-company', {
        }).then(({data}) => {
            setRoleLists(data.data);
        }).catch(error => {
            console.error('Error loading role list:', error);
        });

    }, []);

    const [createUser] = useCreateUserMutation();
    const [updateUser] = useUpdateUserMutation();

    const submit = async (e) => {
        e.preventDefault();
        // setLoading(true);
        let formData = new FormData();
        formData.append('first_name', element.first_name);
        formData.append('last_name', element.last_name);
        formData.append('user_name', element.user_name);
        formData.append('email', element.email);
        formData.append('phone', element.phone);
        formData.append('emergency_contact', element.emergency_contact);
        formData.append('dob', element.dob);
        formData.append('gender', element.gender);
        formData.append('profile', element.profile);
        formData.append('role', element.role);
        formData.append('active', element.active);
        formData.append('attachment', element.attachment);
        const url = slug ? `/update-profile/${element.slug}` : `/users`;

        try{
            let data;
            if (slug){
                 data = await updateUser({slug, formData}).unwrap();
            }else{
                data = await createUser({formData}).unwrap();
            }
            notification("success", data?.message, data?.description);
            handelCloseModal();
        }catch (err){
            if (err.status === 406) {
                const errors = err.errorData;
                notification("error", errors.message, errors.description);

            } else if (err.status === 422) {
                setErrors(err.errorData?.errors);
                notification("error", err?.message);
            } else {
                notification(
                    "error",
                    err?.message || "An error occurred",
                    err?.description || "Please try again later."
                );
                setErrors({});
            }
        }
    }
    const handelImageChange =(e)=>{
        const file = e.target.files[0];
        setElement({...element, avatar: URL.createObjectURL(file),attachment:  e.target.files[0]});
    }
    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <Modal
                show={true}
                onHide={handelCloseModal}
                backdrop="static"
                keyboard={false}
                size={'lg'}
                // fullscreen={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{slug ? 'Update Profile: ' + element.username : 'Add new user'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>

                        <Form>
                            <Row>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="first_name">
                                        <Form.Label><b>First Name</b></Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={element.first_name == null ? '' : element.first_name}
                                            autoFocus
                                            className={'border-primary'}
                                            onChange={(e) => {
                                                setElement({...element, first_name: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="last_name">
                                        <Form.Label><b>Last Name</b></Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={element.last_name == null ? '' : element.last_name}
                                            autoFocus
                                            className={'border-primary'}
                                            onChange={(e) => {
                                                setElement({...element, last_name: e.target.value});
                                            }}
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
                                            value={element.user_name == null ? '' : element.user_name}
                                            autoFocus
                                            className={'border-primary'}
                                            onChange={(e) => {
                                                setElement({...element, user_name: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="first_name">
                                        <Form.Label><b>Email</b></Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={element.email == null ? '' : element.email}
                                            autoFocus
                                            className={'border-primary'}
                                            onChange={(e) => {
                                                setElement({...element, email: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <hr/>
                            <Row>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="phone">
                                        <Form.Label><b>Phone</b></Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={element.phone == null ? '' : element.phone}
                                            autoFocus
                                            className={'border-primary'}
                                            onChange={(e) => {
                                                setElement({...element, phone: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="emergency_contact">
                                        <Form.Label><b>Emergency Contract</b></Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={element.emergency_contact == null ? '' : element.emergency_contact}
                                            autoFocus
                                            className={'border-primary'}
                                            onChange={(e) => {
                                                setElement({...element, emergency_contact: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <hr/>
                            <Row>
                                <Col xs={12} md={4}>
                                    <Form.Group className="mb-3" controlId="dob">
                                        <Form.Label><b>Date of Birth</b></Form.Label>
                                        <Form.Control type="date" value={element.dob} className={'border-primary'} onChange={(e) => {
                                            setElement({...element, dob: e.target.value});
                                        }}/>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Group controlId="gender">
                                        <Form.Label><b>Gender</b></Form.Label>
                                        <Form.Select aria-label="Gender" className={'border-primary'} onChange={(e) => {
                                            setElement({...element, gender: e.target.value});
                                        }}>
                                            <option defaultValue>Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Label><b>Roles</b></Form.Label>
                                    <Form.Select value={element.role} aria-label="Roles" className={'border-primary'} onChange={(e) => {
                                        setElement({...element, role: e.target.value});
                                    }}>
                                        <option defaultValue>{"Set user role"}</option>
                                        {roleLists.length > 0 ? roleLists.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.role.toUpperCase()}
                                                </option>
                                            )) :
                                            (<option defaultValue>{"User Role"}</option>)
                                        }
                                    </Form.Select>
                                </Col>
                            </Row>
                            <hr/>
                            <Row>
                                <Col xs={12} md={12} >
                                    <Form.Group  controlId="avatar" style={{textAlign:'center'}}>
                                        <Image src={element.avatar} style={{height: '150px', width: '150px'}}/>
                                        <Form.Control type="file"  className={'border-primary'} onChange={handelImageChange}/>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handelCloseModal}>Close</Button>
                    <Button variant="primary" onClick={(e) => submit(e)}>Update</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
