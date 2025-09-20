import {Col, Container, Modal, Row} from "react-bootstrap";
import React from "react";
import {Box} from "@mui/material";


const ExpenseShow = ({ handelCloseModal, title, data, currency}) => {
    return (
        <>
            <Modal size={"md"} show={true} centered onHide={handelCloseModal} className="custom-modal modal-lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>{title}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>User Details</strong>

                            <Col xs={6} md={6}>
                                <strong>{'Expense By: '}</strong>{data.user_name}
                            </Col>
                            <Col xs={12} md={6}>
                                <strong>{'Expense Date: '}</strong>{data.date}
                            </Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Bank Details</strong>
                            <Col xs={12} md={12}>
                                <strong>Bank Name: </strong>{data.account.label}
                            </Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Amount</strong>
                            <Col xs={4} md={4}><strong>Amount: </strong>{currency + ' ' + data.amount}</Col>
                            <Col xs={4} md={4}><strong>Refundable: </strong>{currency + ' ' + data.refundable_amount}
                            </Col>
                            <Col xs={4} md={4}><strong>Refunded: </strong>{currency + ' ' + data.refunded_amount}</Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Description</strong>
                            <Col xs={9} md={9}><strong>Description: </strong>{data.description}</Col>
                            <Col xs={3} md={3}><strong>Attachment: </strong>{data.attachment}</Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Others</strong>
                            <Col xs={6} md={6}><strong>Note: </strong>{data.note}</Col>
                            <Col xs={6} md={6}><strong>Reference: </strong>{data.reference}</Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={handelCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ExpenseShow