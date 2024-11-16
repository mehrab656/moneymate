import React, {useEffect, useState, useContext, isValidElement, createElement} from "react";
import axiosClient from "../../../axios-client.js";
import Swal from "sweetalert2";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/MainLoader.jsx";
import {notification} from "../../../components/ToastNotification.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRightArrowLeft, faEye} from "@fortawesome/free-solid-svg-icons";
import {Card, CardActions, CardContent} from "@mui/material";
import Button from 'react-bootstrap/Button';
import TaskHistoryModal from "./TaskHistoryModal.jsx";
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {Form, Modal} from "react-bootstrap";
import {genRand} from "../../../helper/HelperFunctions.js";
import WizCard from "../../../components/WizCard.jsx";
import {
    useMyTaskDataQuery,
    useStartTaskMutation,
    useEndTaskMutation
} from "../../../api/slices/taskSlice.js";

const defaultQuery = {
    quickFilter: '',
    status: '',
    toDate: '',
    fromDate: '',
}
export default function MyTasks() {
    const [searchTerm, setSearchTerm] = useState("");
    const {applicationSettings} = useContext(SettingsContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [taskTimelineModal, setTaskTimelineModal] = useState(false);
    const [taskHistory, setTaskHistory] = useState([]);

    const [query, setQuery] = useState(defaultQuery)
    const {} = applicationSettings;
    const [startTask] = useStartTaskMutation();
    const [endTask] = useEndTaskMutation();
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [hasFilter, setHasFilter] = useState(false)
    const handelCloseFilterModal = () => setShowFilterModal(false);
    const handeShowFilterModal = () => setShowFilterModal(true);

    const onTaskStart = (task) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to start this task !`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, start it!",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await startTask({id: task.id}).unwrap();
                    notification("success", response.message, response.description); // Display success message
                } catch (error) {
                    notification(
                        "error",
                        error.message,
                        error.description || "An error occurred."
                    ); // Display error message
                }
            }
        });
    };
    const onTaskEnd = (task) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to close this task !`,
            icon: "warning",
            input: "text",
            inputPlaceholder: "Comment(if any)",
            showCancelButton: true,
            confirmButtonText: "Yes, close it!",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                let formData = new FormData();
                formData.append('comment', result.value);
                try {
                    const response = await endTask({id: task.id, formData: formData}).unwrap();
                    notification("success", response.message, response.description); // Display success message
                } catch (error) {
                    notification(
                        "error",
                        error.message,
                        error.description || "An error occurred."
                    ); // Display error message
                }
            }
        });
    };
    const showTimelineModalFunc = (task) => {
        setTaskTimelineModal(true);
        setTaskHistory(task);
    }
    const closeTimelineModalFunc = () => {
        setTaskTimelineModal(false);
    }
    // api call
    const {
        data: myTaskData,
        isFetching: taskDataIsFetching,
        isError: taskDataError,
    } = useMyTaskDataQuery(
        {query: query},
    );

    useEffect(() => {
        document.title = "My Tasks";
        if (myTaskData?.data) {
            setLoading(false);
            setTasks(myTaskData?.data);
        }
    }, [myTaskData, hasFilter]);

    const getFilteredData = () => {
        setHasFilter(true);
        setShowFilterModal(false)
    }
    const resetFilter = () => {
        setHasFilter(!hasFilter);
        setQuery(defaultQuery);
        setShowFilterModal(false)

    }
    const pendingTasks = tasks.filter((task) => {
        if (task.status.value === 'pending') {
            return task;
        }
    });
    const ongoingTasks = tasks.filter((task) => {
        if (task.status.value === 'ongoing') {
            return task;
        }
    });
    const completeTasks = tasks.filter((task) => {
        if (task.status.value === 'complete') {
            return task;
        }
    });

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <Row style={{marginBottom: "5px"}}>
                <Col md={6} lg={6} sm={6}>
                    <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Quick
                        Filter</Form.Label>
                    <Form.Select size={"sm"} value={query.quickFilter} aria-label="Payment Status"
                                 onChange={(e) => {
                                     setQuery({...query, quickFilter: e.target.value});
                                     setHasFilter(true)
                                 }}>
                        <option defaultValue>Quick Filter</option>
                        <option value="today">Today's All Task</option>
                        <option value="yesterday">Yesterday's All Task</option>
                        <option value="tomorrow">Tomorrow's All Task</option>
                        <option value="this_week">This week's All Task</option>
                        <option value="last_week">Last week's All Task</option>
                        <option value="next_week">Next Month's All Task</option>
                        <option value="this_month">This Month's All Task</option>
                    </Form.Select>
                </Col>
                <Col md={6} lg={6} sm={6}>
                    <div className={"float-end align-bottom"}>
                        <Button type="button" className={"inline-block btn btn-sm btn-primary"}
                                onClick={handeShowFilterModal}>More Filter</Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <div className='col-md-4 col-sm-12 p-0 border'>
                    <div className="card-box border">
                        <h4 className="text-dark header-title">Upcoming</h4>
                    </div>
                    <ul className="sortable-list taskList list-unstyled ui-sortable" id="upcoming">
                        {pendingTasks.length > 0 ?
                            pendingTasks.map((task, index) => (
                                <li id={`task-${task.slug}`} key={task.slug + index + genRand(8)}>
                                    <Card className={'border-primary '} sx={{p: 5}}
                                          style={{padding: "0px", marginBottom: "20px"}}
                                    >
                                        <div className="my-task-header pending-task-header">
                                            <span>{task.date}</span>
                                            <span>{task.startTime + ' to ' + task.endTime}</span>
                                        </div>

                                        <CardContent style={{minHeight: '100px'}}>
                                            {task.description}
                                        </CardContent>
                                        <CardActions className={'my-task-card-footer'}>
                                            <Button type="button" className={"inline-block btn btn-sm btn-success"}
                                                    onClick={() => onTaskStart(task)}
                                                    >Start</Button>
                                            <a
                                                onClick={() => showTimelineModalFunc(task.workflow)}
                                                style={{cursor: "pointer"}}
                                                className={'text-primary'}
                                                data-tooltip-id='internet-account'
                                                data-tooltip-content={"IncomeShow this internet details"}>
                                                    <span className="aside-menu-icon"><FontAwesomeIcon
                                                        icon={faEye}/></span>
                                            </a>
                                        </CardActions>
                                    </Card>
                                </li>
                            )) :
                            <li id={`notFoundUpcomingTask`} key={genRand(8)}>
                                <Card className={'border-primary '} sx={{p: 5}}
                                      style={{padding: "0px", marginBottom: "20px"}}
                                >
                                    <CardContent class="task-not-found">
                                        {"You Have no Upcoming Task"}
                                    </CardContent>
                                </Card>
                            </li>
                        }

                    </ul>
                </div>
                <div className='col-md-4 col-sm-12 p-0 border'>
                    <div className="card-box border">
                        <h4 className="text-dark header-title">Ongoing</h4>
                    </div>
                    <ul className="sortable-list taskList list-unstyled ui-sortable" id="upcoming">
                        {ongoingTasks.length > 0 ?
                            ongoingTasks.map((task, index) => (

                                <li id={`task-${task.slug}`} key={task.slug + index + genRand(8)}>
                                    <Card className={'border-primary '} sx={{p: 5}}
                                          style={{padding: "0px", marginBottom: "20px"}}
                                    >
                                        <div className="my-task-header ongoing-task-header">
                                            <span>{task.date}</span>
                                            <span>{task.startTime + ' to ' + task.endTime}</span>
                                        </div>

                                        <CardContent style={{minHeight: '100px'}}>
                                            {task.description}
                                            <br/>
                                            <span>Started at : {task.started_at}</span>

                                        </CardContent>
                                        <CardActions className={'my-task-card-footer'}>
                                            <Button type="button" className={"inline-block btn btn-sm btn-primary"}
                                                    onClick={() => onTaskEnd(task)}
                                                    >End</Button>
                                            <a
                                                onClick={() => showTimelineModalFunc(task.workflow)}
                                                style={{cursor: "pointer"}}
                                                className={'text-primary'}
                                                data-tooltip-id='internet-account'
                                                data-tooltip-content={"IncomeShow this internet details"}>
                                                    <span className="aside-menu-icon"><FontAwesomeIcon
                                                        icon={faEye}/></span>
                                            </a>
                                        </CardActions>
                                    </Card>
                                </li>
                            )) :
                            <li id={`notFoundOngoingTask`} key={genRand(8)}>
                                <Card className={'border-primary '} sx={{p: 5}}
                                      style={{padding: "0px", marginBottom: "20px"}}
                                >
                                    <CardContent class="task-not-found">
                                        {"You Have no Ongoing Task"}
                                    </CardContent>
                                </Card>
                            </li>
                        }

                    </ul>
                </div>
                <div className='col-md-4 col-sm-12 p-0 border'>
                    <div className="card-box border">
                        <h4 className="text-dark header-title">Completed</h4>
                    </div>
                    <ul className="sortable-list taskList list-unstyled ui-sortable" id="upcoming">
                        {completeTasks.length > 0 ?
                            completeTasks.map((task, index) => (

                                <li id={`task-${task.id}`} key={task.slug + index + genRand(8)}>
                                    <Card className={'border-primary '} sx={{p: 5}}
                                          style={{padding: "0px", marginBottom: "20px"}}
                                    >
                                        <div className="my-task-header complete-task-header">
                                            <span>{task.date}</span>
                                            <span>{task.startTime + ' to ' + task.endTime}</span>
                                        </div>
                                        <CardContent>
                                            {task.description}
                                            <br/>
                                            <span>Started at : {task.started_at}</span>
                                            <br/>
                                            <span>Ended at : {task.ended_at}</span>
                                        </CardContent>
                                        <CardActions className={'my-task-card-footer float-end'}>
                                            <a
                                                onClick={() => showTimelineModalFunc(task.workflow)}
                                                style={{cursor: "pointer"}}
                                                className={'text-primary'}
                                                data-tooltip-id='internet-account'
                                                data-tooltip-content={"IncomeShow this internet details"}>
                                                    <span className="aside-menu-icon"><FontAwesomeIcon
                                                        icon={faEye}/></span>
                                            </a>
                                        </CardActions>
                                    </Card>
                                </li>
                            )) :
                            <li id={`notFoundCompletedTask`} key={genRand(8)}>
                                <Card className={'border-primary '} sx={{p: 5}}
                                      style={{padding: "0px", marginBottom: "20px"}}
                                >
                                    <CardContent class="task-not-found">
                                        {"You Have no Completed Task"}
                                    </CardContent>
                                </Card>
                            </li>
                        }

                    </ul>
                </div>
            </Row>

            {
                taskTimelineModal &&
                <TaskHistoryModal handelCloseModal={closeTimelineModalFunc}
                                  workflow={taskHistory}
                />
            }

            <Modal
                show={showFilterModal}
                onHide={handelCloseFilterModal}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Body>
                <Row>
                        <Col md={12} sm={12}>
                            <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Task
                                Status</Form.Label>
                            <Form.Select size={"sm"} value={query.status} aria-label="Status"
                                         onChange={(e) => {
                                             setQuery({...query, status: e.target.value});
                                         }}>
                                <option value="pending">Pending</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                            </Form.Select>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={5} sm={5} lg={5}>
                            <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">From </Form.Label>
                            <Form.Control
                                type="date"
                                value={query.fromDate}
                                onChange={(e) => {
                                    setQuery({...query, fromDate: e.target.value});
                                }}
                            />
                        </Col>
                        <Col md={2} sm={2} lg={2}>
                            <span className="aside-menu-icon"><FontAwesomeIcon
                                icon={faArrowRightArrowLeft}/></span>
                        </Col>
                        <Col md={5} sm={5} lg={5}>
                            <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">To </Form.Label>
                            <Form.Control
                                type="date"
                                value={query.toDate}
                                onChange={(e) => {
                                    setQuery({...query, toDate: e.target.value});
                                }}
                            />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className={'filter-footer-combo'}>
                    <div>
                        <Button type="button" className={"inline-block btn btn-sm btn-info"}
                                onClick={resetFilter}>Reset</Button>
                    </div>
                    <div><Button type="button" className={"m-2 inline-block btn btn-sm btn-secondary"}
                                 onClick={handelCloseFilterModal}>Close</Button>
                        <Button type="button" className={"inline-block btn btn-sm btn-primary"}
                                onClick={getFilteredData}>Filter</Button>
                    </div>
                </Modal.Footer>
            </Modal>


        </div>
    );
}
