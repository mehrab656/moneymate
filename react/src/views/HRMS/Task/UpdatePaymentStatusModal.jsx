import React, { useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {Form} from "react-bootstrap";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import axiosClient from "../../../axios-client.js";
import {notification} from "../../../components/ToastNotification.jsx";
import { useNavigate} from "react-router-dom";

function UpdatePaymentStatusModal({showModal, handelCloseModal,setTaskPaymentStatusModal, element}) {
    const navigate = useNavigate();

    const [paymentData, setPaymentData] = useState({
        amount: '',
        payment_status: '',
        comment: ''
    });
    const submit = (e) => {
        e.preventDefault();

        let formData = new FormData();
        formData.append('amount', paymentData.amount);
        formData.append('payment_status', paymentData.payment_status);
        formData.append('comment', paymentData.comment);

        axiosClient.post(`/update-task-payment-status/${element.id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(({data}) => {
            notification('success', data?.message, data?.description);
            handelCloseModal();
            navigate('/all-tasks');
        }).catch((err) => {
            if (err.response) {
                const error = err.response.data
                notification('error', error?.message, error.description);
            }
        });
    }
    return (
        <>
            <Modal
                show={showModal}
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
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="amountUpdate">
                                        <Form.Label> Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="i.g: 50 AED"
                                            autoFocus
                                            onChange={(e) => {
                                                setPaymentData({...paymentData, amount: e.target.value});
                                            }}
                                        />

                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="payment_status">
                                        <Form.Label>Payment Status</Form.Label>
                                        <Form.Select aria-label="Payment Status" onChange={(e) => {
                                            setPaymentData({...paymentData, payment_status: e.target.value});
                                        }}>
                                            <option defaultValue>Select Payment Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="partial_paid">Partially Paid</option>
                                            <option value="paid">Paid</option>
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
                                                setPaymentData({...paymentData, comment: e.target.value});
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

export default UpdatePaymentStatusModal;