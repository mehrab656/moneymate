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
import MainLoader from "../../../components/MainLoader.jsx";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";

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

function TaskAddModal({showModal, handelCloseModal, title,currentTaskList,setTasks}) {
    let {id} = useParams();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false)

    const [taskData, setTaskData] = useState(_initialTaskData);
    const [categories, setCategories] = useState([]);
    const [showExistingTask, setShowExistingTask] = useState(false);
    const [existingTask, setExistingTask]=useState({});
    const [employeeList, setEmployeeList]=useState([]);
    const [userNames, setUserNames] = useState([]);

    useEffect(() => {
            axiosClient.get('/category', {
                params: {type: taskData.type}
            }).then(({data}) => {
                setCategories(data.categories);
            }).catch(error => {
                console.error('Error loading categories:', error);
            });
    }, [taskData.type]);

    useEffect(() => {
            axiosClient.get('/employees', {
            }).then(({data}) => {
                setEmployeeList(data.data);

            }).catch(error => {
                console.error('Error loading Employees:', error);
            });

    }, []);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        let formData = new FormData();
        formData.append('employee_id', taskData.employee_id);
        formData.append('description', taskData.description);
        formData.append('categoryID', taskData.categoryID);
        formData.append('date', taskData.date);
        formData.append('startTime', taskData.startTime);
        formData.append('endTime', taskData.endTime);
        formData.append('type', taskData.type);
        formData.append('amount', taskData.amount);
        formData.append('status', taskData.status);
        formData.append('payment_status', taskData.payment_status);
        formData.append('comment', taskData.comment);

        const url = id ? `/task/${id}` : `/task/add`;

        axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(({data}) => {
            notification('success', data?.message, data?.description);
            setLoading(false);
            location.reload();
        }).catch((err) => {
            if (err.response) {
                const error = err.response.data
                notification('error', error?.message, error.description);
                setErrors({});
                if (err.response.status === 406){
                    setShowExistingTask(true);
                    setExistingTask(error.data);
                }
                if (err.response.status === 422){
                    setErrors(error.errors);
                }
                setLoading(false);
            }
            setLoading(false)
        });
    }


    return (
        <>
            <MainLoader loaderVisible={loading} />
            <Modal
                show={showModal}
                onHide={handelCloseModal}
                backdrop="static"
                keyboard={false}
                size={'lg'}
                // fullscreen={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{title.toUpperCase()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        {
                            showExistingTask &&
                            <div className="alert alert-warning" role="alert">
                                {existingTask.description} <br/>
                                {'Date: ' + existingTask.date}<br/>
                                {'Start Time: ' + existingTask.startTime}<br/>
                                {'End Time: ' + existingTask.endTime}<br/>
                            </div>
                        }
                        <Form>
                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="description">
                                        <Form.Label>Task Description</Form.Label>
                                        <Form.Control as="textarea" autoFocus rows={3} value={taskData.description}
                                                      name={'description'}
                                                      onChange={(e) => {
                                                          setTaskData({...taskData, description: e.target.value});
                                                      }}
                                        />
                                        {errors.description && (
                                            <p className='error-message mt-2'>{errors.description[0]}</p>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={4} lg={4} sm={12}>
                                    <Form.Group className="mb-3" controlId="date">
                                        <Form.Label>Schedule Date</Form.Label>
                                        <Form.Control type="date" value={taskData.date} onChange={(e) => {
                                            setTaskData({...taskData, date: e.target.value});
                                        }}/>
                                        {errors.date && (
                                            <p className='error-message mt-2'>{errors.date[0]}</p>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4} lg={4} sm={12}>
                                    <Form.Group className="mb-3" controlId="startTime">
                                        <Form.Label>Schedule Start Time</Form.Label>
                                        <Form.Control type="time" value={taskData.startTime} onChange={(e) => {
                                            setTaskData({...taskData, startTime: e.target.value});
                                        }}/>
                                        {errors.startTime && (
                                            <p className='error-message mt-2'>{errors.startTime[0]}</p>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4} lg={4} sm={12}>
                                    <Form.Group className="mb-3" controlId="endTime">
                                        <Form.Label>Schedule End Time</Form.Label>
                                        <Form.Control type="time" value={taskData.endTime} onChange={(e) => {
                                            setTaskData({...taskData, endTime: e.target.value});
                                        }}/>
                                        {errors.endTime && (
                                            <p className='error-message mt-2'>{errors.endTime[0]}</p>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <hr className={'border-danger'}/>
                            <Row>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="type">
                                        <Form.Label>Task Type</Form.Label>
                                        <Form.Select aria-label="Task Type" onChange={(e) => {
                                            setTaskData({...taskData, type: e.target.value});
                                        }}>
                                            <option  disabled >Select Task Type</option>
                                            <option value="income">Income</option>
                                            <option value="expense">Expense</option>
                                        </Form.Select>
                                        {errors.type && (
                                            <p className='error-message mt-2'>{errors.type[0]}</p>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="categoryID">
                                        <Form.Label>Task Category</Form.Label>
                                        <Form.Select aria-label="Task Categories" onChange={(e) => {
                                            setTaskData({...taskData, categoryID: e.target.value});
                                        }}>
                                            (<option defaultValue>{"Select task type"}</option>

                                            {categories.length > 0 ? categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                )) :
                                                (<option defaultValue>{"Select task type First"}</option>)
                                            }
                                        </Form.Select>
                                        {errors.categoryID && (
                                            <p className='error-message mt-2'>{errors.categoryID[0]}</p>
                                        )}
                                    </Form.Group>
                                </Col>

                            </Row>

                            <Row>
                                <Col xs={12} md={4}>
                                    <Form.Group className="mb-3" controlId="amount">
                                        <Form.Label> Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="i.g: 50 AED"
                                            onChange={(e) => {
                                                setTaskData({...taskData, amount: e.target.value});
                                            }}
                                        />
                                        {errors.amount && (
                                            <p className='error-message mt-2'>{errors.amount[0]}</p>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Group className="mb-3" controlId="status">
                                        <Form.Label>Task Status</Form.Label>
                                        <Form.Select aria-label="Task Status" onChange={(e) => {
                                            setTaskData({...taskData, status: e.target.value});
                                        }}>
                                            <option defaultValue>Select Task Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="hold">Hold</option>
                                            <option value="complete">Complete</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Group className="mb-3" controlId="payment_status">
                                        <Form.Label>Payment Status</Form.Label>
                                        <Form.Select aria-label="Payment Status" onChange={(e) => {
                                            setTaskData({...taskData, payment_status: e.target.value});
                                        }}>
                                            <option defaultValue>Select Payment Status</option>
                                            <option value="pending">Pending</option>
                                            {/*<option value="partial_paid">Partially Paid</option>*/}
                                            <option value="paid">Paid</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <hr className={'border-danger'}/>
                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group className="mb-3" controlId="employee_id">
                                        <Form.Label>Assign to</Form.Label>
                                        <Form.Control as={"select"} aria-label="Assign to" onChange={(e) => {
                                            setTaskData({...taskData, employee_id: e.target.value});
                                        }}>
                                            <option defaultValue>{"Task Assign to"}</option>
                                            {employeeList.length > 0 ? employeeList.map((employee) => (
                                                    <option key={employee.id} value={employee.id}>
                                                        {employee.name}
                                                    </option>
                                                )) :
                                                (<option defaultValue>{"Task Assign to"}</option>)
                                            }

                                        </Form.Control>
                                        {errors.employee_id && (
                                            <p className='error-message mt-2'>{errors.employee_id[0]}</p>
                                        )}
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
                                            onChange={(e) => {
                                                setTaskData({...taskData, comment: e.target.value});
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
                    <Button variant="primary" onClick={(e) => submit(e)}>Add Task</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default TaskAddModal;