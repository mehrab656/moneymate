import {Col, Container, Modal, Row, Table} from "react-bootstrap";
import React, {memo} from "react";
import Swal from "sweetalert2";
import axiosClient from "../axios-client.js";
import SummeryCardRow from "./SummeryCardRow.jsx";


const SummeryCard = ({showModal, handelCloseModal, data, currency, modalType, Toast, navigation}) => {
    const modalTitles = {
        "electricity": " Electricity Details",
        "internet": " Internet Details",
        "cheque": " Cheque Details",
    }
    console.log(modalType);
    const handelPayment = async (payment) => {
        // setElectricityShowModal(false);
        handelCloseModal(); //otherwise input filed of swal will not work

        await Swal.fire({
            title: "What is the bill amount?",
            // text: "Are You sure the payment has paid!",
            inputLabel: `${payment.payment_number}`,
            input: "number",
            inputAutoFocus: true,
            inputAutoTrim: true,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'pay',
            inputValidator: (value) => {
                if (!value) {
                    return "Bill amount is required!";
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.post(`/pay-bill/${payment.id}`, {
                    ...payment,
                    amount: result.value,
                    type: modalType,
                    date: payment.date,
                }).then(({data}) => {
                    Toast.fire({
                        icon: data.status === 200 ? 'success' : 'error',
                        title: data.message,
                    });
                    navigation('/sectors');
                }).catch(err => {
                    if (err.response) {
                        Toast.fire({
                            icon: "error",
                            title: err.response.data.message,
                        });
                    }
                })
            }
        })
    }
    return (
        <>
            <Modal show={showModal} centered onHide={handelCloseModal} className="custom-modal modal-lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span> {data.name + modalTitles[modalType]}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        {
                            modalType === 'electricity' &&
                            <>
                                <Row className={'border p-2'}>
                                    <strong className={'text-primary'}>Account</strong>
                                    <Col xs={12} md={4}>
                                        <strong>{'Account No: '}</strong>{data.el_acc_no}
                                    </Col>
                                    <Col xs={12} md={4}>
                                        <strong>{'Business ID: '}</strong>{data.el_business_acc_no}
                                    </Col>
                                    <Col xs={12} md={4}>
                                        <strong>{'Premises Number: '}</strong>{data.el_premises_no}
                                    </Col>
                                </Row>
                                <Row className={'border p-2'}>
                                    <strong className={'text-primary'}>Notes</strong>
                                    <Col xs={12} md={6}>
                                        {data.el_note ?? 'Nothing Found!'}
                                    </Col>
                                </Row>
                            </>
                        }
                        {
                            modalType === 'internet' &&
                            <>
                                <Row className={'border p-2'}>
                                    <strong className={'text-primary'}>Account</strong>
                                    <Col xs={12} md={6}>
                                        <strong>{'Account No: '}</strong>{data.internet_acc_no}
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <strong>{'Billing Date: '}</strong>{data.internet_billing_date}
                                    </Col>
                                </Row>
                                <Row className={'border p-2'}>
                                    <strong className={'text-primary'}>Notes</strong>
                                    <Col xs={12} md={6}>
                                        {data.int_note ?? 'Nothing Found!'}
                                    </Col>
                                </Row>
                            </>
                        }

                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Payment History</strong>
                            <Table responsive striped bordered hover variant="light">

                                <thead>
                                <tr>
                                    <th>Payment Details</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data?.payments && data?.payments.length > 0 && data?.payments.map((item, i) => {
                                    if (item.type === 'electricity' && modalType === 'electricity') {
                                        return (
                                            <SummeryCardRow item={item}
                                                            handelPayment={handelPayment}
                                                            currency={currency}
                                                            key={'electricity_row_' + i}
                                            />
                                        )
                                    }
                                    if (item.type === 'internet' && modalType === 'internet') {
                                        return (
                                            <SummeryCardRow item={item}
                                                            handelPayment={handelPayment}
                                                            currency={currency}
                                                            key={'internet_row' + i}

                                            />
                                        )
                                    }
                                    if (item.type === 'cheque' && modalType === 'cheque') {
                                        return (
                                            <SummeryCardRow item={item}
                                                            handelPayment={handelPayment}
                                                            currency={currency}
                                                            key={'cheque_row' + i}

                                            />
                                        )
                                    }

                                })}

                                </tbody>
                            </Table>
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
export default memo(SummeryCard);