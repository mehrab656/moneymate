import MainLoader from "../../components/MainLoader.jsx";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import {Form, InputGroup} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import React, {useState} from "react";
import {useUpdateContractMutation} from "../../api/slices/sectorSlice.js";
import {notification} from "../../components/ToastNotification.jsx";
import {ButtonGroup, Card, CardContent, Grid, TextField, Typography} from "@mui/material";


const initialPaymentState = [
    {
        paymentNumber: '',
        paymentDate: '',
        amount: '',
    },
];

const initialSectorState = {
    contract_start_date: '',
    contract_end_date: '',
    rent: '',

};
export default function ContractExtendForm({handleCloseModal, element,closeFuncAttr}){
    const [loading, setLoading] = useState(false)
    const [paymentData, setPaymentData] = useState(initialPaymentState);
    const [sector, setSector] = useState(initialSectorState);

    const [updateContract] = useUpdateContractMutation();
    const submit = async(e) => {
        e.preventDefault();
        console.log(paymentData);

        let formData = new FormData();
        formData.append('payment_account_id', sector.payment_account_id);
        formData.append('contract_start_date', sector.contract_start_date);
        formData.append('contract_end_date', sector.contract_end_date);

        if ( paymentData && paymentData.length > 0) {
            paymentData.forEach(element => {
                formData.append('payment_amount[]', element.amount);
                formData.append('payment_date[]', element.paymentDate);
                formData.append('payment_number[]', element.paymentNumber);
            });
        }
        const url = `/update-task-status/${element.id}`;

        try {
            const  data  = await updateContract({ url: url, formData }).unwrap();
            notification("success", data?.message, data?.description);
            handleCloseModal()
        } catch (err) {
            notification("error", err?.message || "An error occurred", err?.description || "Please try again later.");
        }
    }

    const handlePaymentInputChange = (e, index) => {
        const {name, value} = e.target;
        const updatedPayments = [...paymentData];
        updatedPayments[index][name] = value;
        setPaymentData(updatedPayments);
    };
    const handleAddPaymentRow = () => {
        setPaymentData([...paymentData, {paymentNumber: '', paymentDate: '', amount: ''}]);
    };

    const handleRemovePaymentRow = (index) => {
        const updatedPayments = [...paymentData];
        updatedPayments.splice(index, 1);
        setPaymentData(updatedPayments);
    };


    return(<>
        <>
            <MainLoader loaderVisible={loading} />
            <Modal
                show={true}
                onHide={()=>{
                    handleCloseModal(closeFuncAttr)
                }}
                backdrop="static"
                keyboard={false}
                size={'lg'}
                // fullscreen={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{"Extend Contract"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Form>
                            <Row>
                                <Col xs={12} md={6}>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="current-starting-date">
                                            Current Starting Date
                                        </InputGroup.Text>
                                        <Form.Control type="date"
                                                      value={element.contract_start_date}
                                                      disabled={true}
                                                      id="current-starting-date" aria-describedby="basic-addon3" />
                                    </InputGroup>
                                </Col>
                                <Col xs={12} md={6}>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="new-starting-date">
                                            New Starting Date
                                        </InputGroup.Text>
                                        <Form.Control type="date" id="new-starting-date" aria-describedby="basic-addon3"
                                                      onChange={(e) => {
                                                          setSector({...sector, contract_start_date: e.target.value});
                                                      }}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={6}>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="current-starting-date">
                                            Current Expire Date
                                        </InputGroup.Text>
                                        <Form.Control type="date" disabled={true} value={element.contract_end_date} id="current-expire-date"
                                                      aria-describedby="basic-addon3"
                                        />
                                    </InputGroup>
                                </Col>
                                <Col xs={12} md={6}>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="current-starting-date">
                                            New Expire Date
                                        </InputGroup.Text>
                                        <Form.Control type="date"  id="new-expire-date" aria-describedby="basic-addon3"
                                                      onChange={(e) => {
                                                          setSector({...sector, contract_end_date: e.target.value});
                                                      }}/>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={6}>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="current-contract-value">
                                            Current Contract Value
                                        </InputGroup.Text>
                                        <Form.Control type="number" disabled={true} value={element.rent} id="current-contract-value" aria-describedby="basic-addon3" />
                                    </InputGroup>
                                </Col>

                                <Col xs={12} md={6}>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="new-contract-value">
                                            New Contract Value
                                        </InputGroup.Text>
                                        <Form.Control type="number"  id="new-contract-value" aria-describedby="basic-addon3"
                                                      onChange={(e) => {
                                                          setSector({...sector, rent: e.target.value});
                                                      }}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                                <Typography variant="h5" gutterBottom>
                                            Payment
                                        </Typography>
                                {paymentData.map((payment, index) =>
                                    <Row>
                                        <Col sm={5} md={5}>
                                            <Form.Group className="mb-3" controlId="paymentNumber">
                                                <Form.Label style={{marginBottom: '0px'}}
                                                            className="custom-form-label">Payment Number</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={payment.paymentNumber}
                                                    name={"paymentNumber"}
                                                    onChange={(e) => handlePaymentInputChange(e, index)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm={3} md={3}>
                                            <Form.Group className="mb-3" controlId="paymentDate">
                                                <Form.Label style={{marginBottom: '0px'}}
                                                            className="custom-form-label">Payment Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={payment.paymentDate}
                                                    name={"paymentDate"}
                                                    onChange={(e) => handlePaymentInputChange(e, index)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm={3} md={3}>
                                            <Form.Group className="mb-3" controlId="amount">
                                                <Form.Label style={{marginBottom: '0px'}}
                                                            className="custom-form-label">Amount</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={payment.amount}
                                                    name={"amount"}
                                                    onChange={(e) => handlePaymentInputChange(e, index)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm={1} md={1}>
                                            <ButtonGroup size="sm" className="addRowBtn ">
                                                <Button variant="success" onClick={handleAddPaymentRow}>+</Button>
                                                {index > 0 && (
                                                    <Button variant="danger" onClick={() => handleRemovePaymentRow(index)}>-</Button>
                                                )}
                                            </ButtonGroup>

                                        </Col>
                                    </Row>
                            )}
                        </Form>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleCloseModal}>Close</Button>
                    <Button variant="primary" onClick={(e) => submit(e)}>Update</Button>
                </Modal.Footer>
            </Modal>
        </>
    </>)
}