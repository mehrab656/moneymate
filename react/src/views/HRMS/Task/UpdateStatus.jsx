import React, { useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {Form} from "react-bootstrap";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import axiosClient from "../../../axios-client.js";
import {notification} from "../../../components/ToastNotification.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { useUpdateTaskStatusMutation } from '../../../api/slices/taskSlice.js';

const _initial = {
    task_status: '',
    comment: ''
};
function UpdateStatus({showModal, handelCloseModal, element,getFunc}) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState({
        task_status: '',
        comment: ''
    });

    const [updateTaskStatus] = useUpdateTaskStatusMutation();


    const submit = async(e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append('task_status', status.task_status);
        formData.append('comment', status.comment);

        const url = `/update-task-status/${element.id}`;
        try {
            const  data  = await updateTaskStatus({ url: url, formData }).unwrap(); 
            notification("success", data?.message, data?.description);
            handelCloseModal()
          } catch (err) {
            notification("error", err?.message || "An error occurred", err?.description || "Please try again later.");
          }
    }
    return (
        <>
            <MainLoader loaderVisible={loading} />
            <Modal
                show={true}
                onHide={handelCloseModal}
                backdrop="static"
                keyboard={false}
                size={'lg'}
                // fullscreen={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{element.description}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>

                        <Form>
                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group className="mb-3" controlId="task_status">
                                        <Form.Label>Task Status</Form.Label>
                                        <Form.Select aria-label="Payment Status" onChange={(e) => {
                                            setStatus({...status, task_status: e.target.value});
                                        }}>
                                            <option defaultValue>Select Task Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="complete">Complete</option>
                                            <option value="cancelled">Cancel</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group className="mb-3" controlId="comment">
                                        <Form.Label> Comment(if any)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="if any comment, put here..."
                                            autoFocus
                                            onChange={(e) => {
                                                setStatus({...status, comment: e.target.value});
                                            }}
                                        />
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

export default UpdateStatus;