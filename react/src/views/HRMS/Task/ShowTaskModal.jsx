import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from "react-bootstrap/Image";
import Paper from "@mui/material/Paper";
import {Table, TableBody, TableContainer} from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

const genRand = (len) => {
    return Math.random()
        .toString(36)
        .substring(2, len + 2);
};
function ShowTaskModal({handelCloseModal, element}) {
    return (
        <>
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
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Details</strong>

                            <Col xs={12} md={4}>
                                <strong>{'Task Details: '}</strong>{element.description}
                            </Col>
                            <Col xs={12} md={4}>
                                <strong>{'Amount: '}</strong>{element.amount}
                            </Col>
                            <Col xs={12} md={4}>
                                <strong>{'Task Type: '}</strong>{element.type}
                            </Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <Col xs={12} md={12}>
                                <strong>{'Scheduled Slot: '}</strong>{element.slot}
                            </Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>Status</strong>

                            <Col xs={12} md={6}>
                                <strong>{'Task Status: '}</strong>{element.status}
                            </Col>
                            <Col xs={12} md={6}>
                                <strong>{'Payment Status: '}</strong>{element.payment_status}
                            </Col>
                        </Row>
                        <Row className={'border p-2'}>
                            <strong className={'text-primary'}>History</strong>

                            <TableContainer component={Paper}>
                                <Table size={'small'} aria-label={'show-task-history'}>
                                    <TableBody>
                                        {element.workflow.map((item, index) => {
                                            return (
                                                <>
                                                    <TableRow key={genRand(8)}>
                                                        <TableCell scope="row" style={{ textAlign: "left" }}>
                                                            <Image src={item.avatar}
                                                                   roundedCircle style={{height: '40px', width: '40px',padding:'3px'}}/>
                                                            <small> [{item.type.replaceAll('_',' ')}] </small>
                                                            {item.userName + ' ' + item.description}
                                                            <small className={"text-muted"}>({item.date_time})</small>
                                                        </TableCell>
                                                    </TableRow>
                                                </>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handelCloseModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ShowTaskModal;