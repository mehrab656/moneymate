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
import {CardBody} from "react-bootstrap";

const defaultQuery = {
    employee_id: '',
    status: '',
    payment_status: '',
    orderBy: '',
    order: '',
    limit: '',
    category_id: '',
    end_date: '',
    start_date: '',
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
            <Card>
                <Row style={{padding:'10px'}}>
                    {
                        tasks.length > 0 && tasks.map((task) => {
                            return <>

                                <Col md={3} sm={12}>
                                    <Card className={'border-primary'} key={task.slug} sx={{p: 5}} style={{padding: "0px", marginBottom:"20px"}}>
                                        <div class="my-task-header">
                                            <span>{task.date}</span>
                                            <span>{task.startTime +' to '+task.endTime}</span>
                                        </div>
                                        {/*<CardHeader title={<><small>{task.slot}</small></>}*/}
                                        {/*/>*/}
                                        <CardContent style={{minHeight: '100px'}}>
                                            {/*{*/}
                                            {/*    task.started_at &&*/}
                                            {/*    <div className="alert alert-warning " role="alert" style={{width: '100%'}}>*/}
                                            {/*        {task.started_at}*/}
                                            {/*    </div>*/}
                                            {/*}*/}

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
                                                data-tooltip-content={"Show this internet details"}>
                                                    <span className="aside-menu-icon">
                                                        <FontAwesomeIcon
                                                            icon={faEye}/>
                                                    </span>
                                            </a>
                                            <Button variant="danger" onClick={() => endTask(task)}
                                                    disabled={!!task.ended_at}>End</Button>
                                        </CardActions>
                                    </Card>
                                </Col>
                            </>
                        })
                    }
                </Row>

            </Card>

            <TaskHistoryModal showModal={taskTimelineModal}
                              handelCloseModal={closeTimelineModalFunc}
                              workflow={taskHistory}
            />
        </div>
    );
}
