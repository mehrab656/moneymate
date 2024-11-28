import React, {useEffect, useState, useContext, isValidElement, createElement} from "react";
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
    CardContent, CardHeader, TableContainer, TextField
} from "@mui/material";
import Button from 'react-bootstrap/Button';
import TaskHistoryModal from "./TaskHistoryModal.jsx";
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {CardBody, Form} from "react-bootstrap";
import {genRand} from "../../../helper/HelperFunctions.js";
import WizCard from "../../../components/WizCard.jsx";
import {useDeleteTaskMutation, useMyTaskDataQuery} from "../../../api/slices/taskSlice.js";
import Paper from "@mui/material/Paper";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import ActionButtonHelpers from "../../../helper/ActionButtonHelpers.jsx";
import Table from "@mui/material/Table";

const defaultQuery = {
    quickFilter: 'today',
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
    }, [myTaskData, query]);

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

            <WizCard className="animated fadeInDown wiz-card-mh">
                <Row>
                    <Col md={6} lg={6} sm={6}>
                        <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Quick
                            Filter</Form.Label>
                        <Form.Select size={"sm"} value={query.quickFilter} aria-label="Payment Status"
                                     onChange={(e) => {
                                         setQuery({...query, quickFilter: e.target.value});
                                     }}>
                            <option value="today">Today's All Task</option>
                            <option value="yesterday">Yesterday's All Task</option>
                            <option value="tomorrow">Tomorrow's All Task</option>
                            <option value="this_week">This week's All Task</option>
                            <option value="last_week">Last week's All Task</option>
                            <option value="next_week">Next Month's All Task</option>
                            <option value="this_month">This Month's All Task</option>
                        </Form.Select>
                    </Col>
                </Row>
                <div className='col-4'>
                    <Table size={'sm'} aria-label={'my-task-table'}>
                        <TableHead>
                            <TableRow>
                                <TableCell align={'center'}><b>Pending</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks.length > 0 && tasks.map((task, index) => (
                                <TableRow key={genRand(12)}>
                                    <TableCell align={'center'} key={genRand(8)}>
                                        <Card className={'border-primary '} sx={{p: 5}}
                                              style={{padding: "0px", marginBottom: "20px"}}
                                        >
                                            <div className="my-task-header">
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

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
