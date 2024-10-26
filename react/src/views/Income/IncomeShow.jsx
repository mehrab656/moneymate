import {Col, Container, Modal, Row} from "react-bootstrap";
import React, {memo} from "react";


const IncomeShow = ({ handleCloseModal, data, currency})=>{

    return (
        <>
            <Modal show={true} centered onHide={handleCloseModal} className="custom-modal modal-lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>Incomes Details</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Income Details</strong>

                            <Col xs={12} md={4}>
                                <strong>{'Category: '}</strong>{data.category_name}
                            </Col>
                            <Col xs={12} md={4}>
                                <strong>{'Amount: '}</strong>{currency+' '+data.amount}
                            </Col>
                            <Col xs={12} md={4}>
                                <strong>{'Date: '}</strong>{data.date}
                            </Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Bank Details</strong>
                            <Col xs={6} md={6}>
                                <strong>Bank Name: </strong>{data.bank_name}
                            </Col>
                            <Col xs={12} md={6}>
                                <strong>Account Number: </strong>{data.account_number}
                            </Col>
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
                    <button className="btn btn-primary" onClick={handleCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>

        </>
    )
}

export default memo(IncomeShow);