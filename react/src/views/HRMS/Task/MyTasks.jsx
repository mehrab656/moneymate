import React, {useEffect, useState, useContext} from "react";
import axiosClient from "../../../axios-client.js";
import Swal from "sweetalert2";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/MainLoader.jsx";
import {notification} from "../../../components/ToastNotification.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Box,
    Card,
    CardActionArea,
    CardActions,
    CardContent, CardHeader, TextField
} from "@mui/material";
import Button from 'react-bootstrap/Button';
import TaskHistoryModal from "./TaskHistoryModal.jsx";
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {CardBody, Form} from "react-bootstrap";
import {genRand} from "../../../helper/HelperFunctions.js";
import WizCard from "../../../components/WizCard.jsx";

const query = {
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


    const onDelete = (task) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover the task !`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient
                    .delete(`delete-task/${task.id}`)
                    .then(({data}) => {
                        getTasks();
                        notification("success", data?.message, data?.description);
                    })
                    .catch((err) => {
                        if (err.response) {
                            const error = err.response.data;
                            notification("error", error?.message, error.description);
                        }
                    });
            }
        });
    };
    const startTask = (task) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to start this task !`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, start it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient
                    .post(`task-has-started/${task.id}`)
                    .then(({data}) => {
                        getTasks();
                        notification("success", data?.message, data?.description);
                    })
                    .catch((err) => {
                        if (err.response) {
                            const error = err.response.data;
                            notification("error", error?.message, error.description);
                        }
                    });
            }
        });
    };
    const endTask = (task) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to close this task !`,
            icon: "warning",
            input: "text",
            inputPlaceholder: "Comment(if any)",
            showCancelButton: true,
            confirmButtonText: "Yes, close it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                let formData = new FormData();
                formData.append('comment', result.value);
                axiosClient
                    .post(`task-has-ended/${task.id}`, formData)
                    .then(({data}) => {
                        getTasks();
                        notification("success", data?.message, data?.description);
                    })
                    .catch((err) => {
                        if (err.response) {
                            const error = err.response.data;
                            notification("error", error?.message, error.description);
                        }
                    });
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

    const getTasks = () => {
        setLoading(true);
        axiosClient
            .get("/my-tasks", {params: query})
            .then(({data}) => {
                setLoading(false);
                setTasks(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "My Tasks";
        getTasks();
    }, []);

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <Row>
                <Col md={6} lg={6} sm={6}>
                    <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Quick Filter</Form.Label>
                    <Form.Select size={"sm"} value={query.quickFilter} aria-label="Payment Status" onChange={(e) => {
                        setQuery({...query, quickFilter: e.target.value});
                    }}>
                        <option value="today">Today's All Task</option>
                        <option value="tomorrow">Today's All Task</option>
                        <option value="this_week">Today's All Task</option>
                        <option value="next_week">Today's All Task</option>
                        <option value="this_month">Today's All Task</option>
                    </Form.Select>
                </Col>
            </Row>
            <WizCard className="animated fadeInDown wiz-card-mh">

                {
                    tasks.length > 0 && tasks.map((task, index) => {
                        return <>
                            <Card  className={'border-primary col-12 col-md-3'} sx={{p: 5}} style={{padding: "0px", marginBottom: "20px"}}
                                  key={task.slug + genRand(8)}>
                                <div className="my-task-header" key={genRand(8)}>
                                    <span>{task.date}</span>
                                    <span>{task.startTime + ' to ' + task.endTime}</span>
                                </div>

                                <CardContent style={{minHeight: '100px'}}>
                                    {task.description}
                                </CardContent>
                                <CardActions className={'my-task-card-footer'}>
                                    <Button variant="success" onClick={() => startTask(task)}
                                            disabled={!!task.started_at}>{
                                        task.started_at ? 'Started..' : 'Start'
                                    }</Button>
                                    <a
                                        onClick={() => showTimelineModalFunc(task.workflow)}
                                        style={{cursor: "pointer"}}
                                        className={'text-primary'}
                                        data-tooltip-id='internet-account'
                                        data-tooltip-content={"IncomeShow this internet details"}>
                                        <span className="aside-menu-icon"><FontAwesomeIcon icon={faEye}/></span>
                                    </a>
                                    <Button variant="danger" onClick={() => endTask(task)}
                                            disabled={!!task.ended_at}>End</Button>
                                </CardActions>
                            </Card>
                        </>
                    })
                }
            </WizCard>
            {
                taskTimelineModal &&
                <TaskHistoryModal handelCloseModal={closeTimelineModalFunc}
                                  workflow={taskHistory}
                />
            }

        </div>
    );
}
