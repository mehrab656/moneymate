import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {Form} from "react-bootstrap";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import axiosClient from "../../../axios-client.js";
import Select from "react-select";
import {notification} from "../../../components/ToastNotification.jsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import TimelineItem from "./TimelineItem.jsx"
const _initialTaskData = {
    description: '',
    employee_id: '',
    categoryID: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'income',
    amount: '',
    status: 'pending',
    payment_status: 'pending',
    workflow: [],
    comment: '',
}

function TaskHistoryModal({ handelCloseModal, workflow=[]}) {
    return (
        <>
            <Modal
                show={true}
                onHide={handelCloseModal}
                backdrop="static"
                keyboard={false}
                size={'lg'}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{'Task History'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        {
                            workflow.length > 0 && (
                                <div className="timeline-container">
                                    {workflow.map((data, idx) => (
                                        <TimelineItem data={data} key={idx} />
                                    ))}
                                </div>
                            )
                        }


                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handelCloseModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default TaskHistoryModal;