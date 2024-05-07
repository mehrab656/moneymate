import React, {memo} from "react";
import {Col, Container, Modal, Row} from "react-bootstrap";

const CompanyViewModal = ({showModal, handelCloseModal, title, data}) => {
    return (
        <>
            <Modal show={showModal} centered onHide={handelCloseModal} className="custom-modal modal-lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>{title}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Company Details</strong>
                            <Col xs={12} md={6}>
                                <strong>{'Name: '}</strong>{data.name}
                            </Col>
                            <Col xs={12} md={4}>
                                <strong>{'Email: '}</strong>{data.email}
                            </Col>
                            <Col xs={12} md={4}>
                                <strong>{'Phone: '}</strong>{data.phone}
                            </Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>License Details</strong>
                            <Col xs={6} md={6}>
                                <strong>Bank Name: </strong>{data?.license_no}
                            </Col>
                            <Col xs={12} md={6}>
                                <strong>Registration Number: </strong>{data?.registration_number}
                            </Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Description</strong>
                            <Col xs={6} md={6}><strong>Issue date: </strong>{data?.issue_date}</Col>
                            <Col xs={6} md={6}><strong>Expiry date: </strong>{data?.expiry_date}</Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Others</strong>
                            <Col xs={6} md={6}><strong>Note: </strong>{data?.extra}</Col>
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
export default memo(CompanyViewModal);