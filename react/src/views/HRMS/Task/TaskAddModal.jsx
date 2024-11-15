import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {Form} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Select from "react-select";
import {notification} from "../../../components/ToastNotification.jsx";
import MainLoader from "../../../components/MainLoader.jsx";
import {useGetAllEmployeeDataQuery} from "../../../api/slices/employeeSlice.js";
import {useCreateTaskMutation, useGetSingleTaskDataQuery} from "../../../api/slices/taskSlice.js";
import {useGetCategoryListDataQuery} from "../../../api/slices/categorySlice.js";
import {faDownload, faEye, faEyeSlash, faRefresh, faSync} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useDispatch} from "react-redux";


const defaultTaskData = {
    description: "",
    category: {},
    employee_list: [],
    date: "",
    startTime: "",
    endTime: "",
    type: {},
    amount: "",
    status: {},
    payment_status: {},
    workflow: [],
    comment: "",
};

function TaskAddModal({handelCloseModal, title, id}) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [taskData, setTaskData] = useState(defaultTaskData);
    const [categories, setCategories] = useState([]);
    const {
        data: getSingleTaskData,
        isFetching: singleTaskFetching,
        isError: singleTaskDataError,
    } = useGetSingleTaskDataQuery({
        id: id,
    });
    const {
        data: getCategoryListData,
        isFetching: categoryDataFetching,
        isError: categoryDataError,
    } = useGetCategoryListDataQuery({
        categoryType: taskData?.type?.value
    });
    useEffect(() => {
        if (id && getSingleTaskData?.data) {
            setTaskData(getSingleTaskData?.data);
        }
        if (getCategoryListData?.data.length > 0) {
            setCategories(getCategoryListData?.data);
        }
    }, [id, getSingleTaskData, getCategoryListData]);

    const {
        data: getAllEmployeeData,
        isFetching: allEmployeeDataFetching,
        isError: allEmployeeDataDataError,
    } = useGetAllEmployeeDataQuery({
        currentPage: "",
        pageSize: 100,
    });
    const modifiedEmployeeList = getAllEmployeeData?.data.map(({id, name}) => {
        return {
            value: id,
            label: name
        }
    });
    const [createTask] = useCreateTaskMutation();
    const submit = async (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append("employee_list", JSON.stringify(taskData.employee_list));
        formData.append("description", taskData.description);
        formData.append("categoryID", taskData.category.value);
        formData.append("date", taskData.date);
        formData.append("startTime", taskData.startTime);
        formData.append("endTime", taskData.endTime);
        formData.append("type", taskData.type.value);
        formData.append("amount", taskData.amount);
        if (!id){
            formData.append("status", taskData.status.value);
            formData.append("payment_status", taskData.payment_status.value);
        }
        formData.append("comment", taskData.comment);

        const url = id ? `/task/${id}` : `/task/add`;

        try {
            const data = await createTask({url: url, formData}).unwrap();
            notification("success", data?.message, data?.description);
            handelCloseModal();
        } catch (err) {
            if (err.status === 406) {
                const errors = err.errorData;
                notification("error", errors.message, errors.description);

            } else if (err.status === 422) {
                setErrors(err.errorData?.errors);
                notification("error", err?.message);
            } else {
                notification(
                    "error",
                    err?.message || "An error occurred",
                    err?.description || "Please try again later."
                );
                setErrors({});
            }
        }
    };
    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <Modal
                show={true}
                onHide={handelCloseModal}
                backdrop="static"
                keyboard={false}
                size={"lg"}
                // fullscreen={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{id?'Task Modify':'Task Add'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <div className="alert alert-warning" role="alert">
                            If you make the payment status as "Paid/Done" from here, it has to
                            be added the income separately.
                            <br/>
                        </div>
                        <Form>
                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group className="mb-3" controlId="description">
                                        <Form.Label>Task Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            autoFocus
                                            rows={3}
                                            value={taskData.description}
                                            name={"description"}
                                            onChange={(e) => {
                                                setTaskData({
                                                    ...taskData,
                                                    description: e.target.value,
                                                });
                                            }}
                                        />
                                        {errors.description && (
                                            <p className="error-message mt-2">
                                                {errors.description[0]}
                                            </p>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={4} lg={4} sm={12}>
                                    <Form.Group className="mb-3" controlId="date">
                                        <Form.Label>Schedule Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={taskData.date}
                                            onChange={(e) => {
                                                setTaskData({...taskData, date: e.target.value});
                                            }}
                                        />
                                        {errors.date && (
                                            <p className="error-message mt-2">{errors.date[0]}</p>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4} lg={4} sm={12}>
                                    <Form.Group className="mb-3" controlId="startTime">
                                        <Form.Label>Schedule Start Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={taskData.startTime}
                                            onChange={(e) => {
                                                setTaskData({...taskData, startTime: e.target.value});
                                            }}
                                        />
                                        {errors.startTime && (
                                            <p className="error-message mt-2">
                                                {errors.startTime[0]}
                                            </p>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4} lg={4} sm={12}>
                                    <Form.Group className="mb-3" controlId="endTime">
                                        <Form.Label>Schedule End Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={taskData.endTime}
                                            onChange={(e) => {
                                                setTaskData({...taskData, endTime: e.target.value});
                                            }}
                                        />
                                        {errors.endTime && (
                                            <p className="error-message mt-2">{errors.endTime[0]}</p>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <hr className={"border-danger"}/>
                            <Row>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="type">
                                        <Form.Label style={{marginBottom: '0px'}}
                                                    className="custom-form-label">Type</Form.Label>
                                        <Select
                                            className="basic-single"
                                            classNamePrefix="select"
                                            value={taskData.type}
                                            isSearchable={true}
                                            name="type"
                                            isLoading={false}
                                            options={[
                                                {
                                                    label: "Income",
                                                    value: "income"
                                                },
                                                {
                                                    label: "Expense",
                                                    value: "expense"
                                                }
                                            ]}
                                            onChange={(e) => {
                                                setTaskData({...taskData, type: e,category: {}});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="category">
                                        <Form.Label style={{marginBottom: '0px'}}
                                                    className="custom-form-label">Category
                                        </Form.Label>
                                        <Select
                                            className="basic-single"
                                            classNamePrefix="select"
                                            value={taskData.category}
                                            isSearchable={true}
                                            name="category"
                                            isLoading={categoryDataFetching}
                                            options={categories}
                                            onChange={(e) => {
                                                setTaskData({...taskData, category: e});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12} md={4}>
                                    <Form.Group className="mb-3" controlId="amount">
                                        <Form.Label style={{marginBottom: '0px'}}
                                                    className="custom-form-label">Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="i.g: 50 AED"
                                            value={taskData.amount}
                                            onChange={(e) => {
                                                setTaskData({...taskData, amount: e.target.value});
                                            }}
                                        />
                                        {errors.amount && (
                                            <p className="error-message mt-2">{errors.amount[0]}</p>
                                        )}
                                    </Form.Group>
                                </Col>

                                {
                                    !id &&
                                        <>
                                            <Col xs={12} md={4}>
                                                <Form.Group className="mb-3" controlId="status">
                                                    <Form.Label style={{marginBottom: '0px'}}
                                                                className="custom-form-label">Status</Form.Label>
                                                    <Select
                                                        className="basic-single"
                                                        classNamePrefix="select"
                                                        value={taskData.status}
                                                        isSearchable={true}
                                                        name="status"
                                                        isLoading={false}
                                                        options={[
                                                            {
                                                                label: "Pending",
                                                                value: "pending"
                                                            },
                                                            {
                                                                label: "Complete",
                                                                value: "complete"
                                                            }
                                                        ]}
                                                        onChange={(e) => {
                                                            setTaskData({...taskData, status: e});
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} md={4}>
                                                <Form.Group className="mb-3" controlId="payment_status">
                                                    <Form.Label style={{marginBottom: '0px'}}
                                                                className="custom-form-label">Payment Status</Form.Label>
                                                    <Select
                                                        className="basic-single"
                                                        classNamePrefix="select"
                                                        value={taskData.payment_status}
                                                        isSearchable={true}
                                                        name="payment_status"
                                                        isLoading={false}
                                                        options={[
                                                            {
                                                                label: "Pending",
                                                                value: "pending"
                                                            },
                                                            {
                                                                label: "Paid",
                                                                value: "paid"
                                                            }
                                                        ]}
                                                        onChange={(e) => {
                                                            setTaskData({...taskData, payment_status: e});
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </>
                                }

                            </Row>
                            <hr className={"border-danger"}/>
                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group className="mb-3" controlId="employee_id">
                                        <Form.Label>Assign to</Form.Label>
                                        <small>
                                        <a onClick={(e)=>{
                                            console.log('clicked');

                                        }}
                                        className={'text-muted p-1'}>
                                            <FontAwesomeIcon icon={faSync}/>
                                        </a></small>
                                        <Select
                                            isMulti
                                            className="basic-single"
                                            classNamePrefix="select"
                                            value={taskData.employee_list}
                                            isSearchable={true}
                                            name="employee_id"
                                            isLoading={allEmployeeDataFetching}
                                            options={modifiedEmployeeList}
                                            onChange={(e) => {
                                                setTaskData({...taskData, employee_list: e});
                                            }}
                                        />
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
                                            value={taskData.comment}
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
                    <Button variant="danger" onClick={handelCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={(e) => submit(e)}>
                        Add Task
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default TaskAddModal;
