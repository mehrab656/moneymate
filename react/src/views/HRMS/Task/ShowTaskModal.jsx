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

function ShowTaskModal({showModal, handelCloseModal, element}) {
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handelCloseModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ShowTaskModal;