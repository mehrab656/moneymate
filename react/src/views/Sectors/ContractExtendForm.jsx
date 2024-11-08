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

export default function ContractExtendForm({handleCloseModal, element,closeFuncAttr}){
    const [loading, setLoading] = useState(false)


    const [updateContract] = useUpdateContractMutation();
    const submit = async(e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append('task_status', 'test');
        formData.append('comment', 'test');

        const url = `/update-task-status/${element.id}`;

        try {
            const  data  = await updateContract({ url: url, formData }).unwrap();
            notification("success", data?.message, data?.description);
            handleCloseModal()
        } catch (err) {
            notification("error", err?.message || "An error occurred", err?.description || "Please try again later.");
        }
    }
    console.log(element);


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
                                        <Form.Control type="date" id="current-starting-date" aria-describedby="basic-addon3" />
                                    </InputGroup>
                                </Col>
                                <Col xs={12} md={6}>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="current-starting-date">
                                            New Starting Date
                                        </InputGroup.Text>
                                        <Form.Control type="date" id="current-starting-date" aria-describedby="basic-addon3" />
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={6}>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="current-starting-date">
                                            Current Expire Date
                                        </InputGroup.Text>
                                        <Form.Control type="date" id="current-starting-date" aria-describedby="basic-addon3" />
                                    </InputGroup>
                                </Col>
                                <Col xs={12} md={6}>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="current-starting-date">
                                            New Expire Date
                                        </InputGroup.Text>
                                        <Form.Control type="date" id="current-starting-date" aria-describedby="basic-addon3" />
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12} md={12}>

                                </Col>
                            </Row>
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