import React, {useEffect, useState, useContext} from "react";
import axiosClient from "../../../axios-client.js";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import {Modal} from "react-bootstrap";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/MainLoader.jsx";
import {checkPermission, compareDates} from "../../../helper/HelperFunctions.js";
import SummeryCard from "../../../helper/SummeryCard.jsx";
import {notification} from "../../../components/ToastNotification.jsx";


import Iconify from "../../../components/Iconify.jsx";
import CommonTable from "../../../helper/CommonTable.jsx";
import TaskAddModal from "./TaskAddModal.jsx";
const _initialTaskData = {
    description: '',
    employee: '',
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
const query = {
    employee_id:1,
    status:'',
    payment_status:'',
    orderBy:'',
    order:'',
    limit:'',
    category_id:'',
    end_date:'',
    start_date:'',
}
export default function Task() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const {applicationSettings, userRole, userPermission} = useContext(SettingsContext);
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState(_initialTaskData);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalAsset, steAssetModel] = useState(false);

    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;

    const TABLE_HEAD = [
        {id: "description", label: "Description", align: "left"},
        {id: "employee", label: "Assigned", align: "left"},
        {id: "amount", label: "Amount", align: "right"},
        {id: "slot", label: "Slot", align: "left"},
        {id: "status", label: "Status", align: "left"},
        {id: "payment_status", label: "Payment", align: "left"},
        {id: "history", label: "History", align: "left"},
        {id: "type", label: "Type", align: "left"},
    ];


    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);
    const actionParams = {
        route: {
            editRoute: "/task/update/",
            viewRoute: "",
            deleteRoute: "",
        },
    };

    const filteredTasks = tasks.filter(
        (task) =>
            task.description.toLowerCase().includes(searchTerm.toLowerCase())
            // task.employee.toLowerCase().includes(searchTerm.toLowerCase());
    );

    const modifiedTaskData = filteredTasks.map(({id,description,slot,employee_name,startTime,endTime,amount,date,status,payment_status,workflow,type}, index) => {
        const task ={};
        const statusClass = (status==='pending'?'warning':(status==='complete'?'success':'danger'));
        const PaymentStatusClass = (payment_status==='pending'?'warning':(payment_status==='complete'?'success':'danger'));

        // task.description=
        task.employee=employee_name.charAt(0).toUpperCase() + employee_name.slice(1);
        task.amount=amount;
        task.slot= slot;
        task.status=<span className={`text-${statusClass}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        task.payment_status = <span className={`text-${PaymentStatusClass}`}>{payment_status.charAt(0).toUpperCase() + payment_status.slice(1)}</span>
        task.history ='history';
        task.type = type.charAt(0).toUpperCase() + type.slice(1);
        task.description =description;
        task.id =id;
        return task;
    });

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
                    .delete(`task/${task.id}`)
                    .then((data) => {
                        getTasks(currentPage, pageSize);
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

    const showAsset = (task) => {
        setTask(task);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
    };
    const handelShowModal = () => {
        setShowModal(true);
    }

    const getTasks = (page, pageSize) => {
        setLoading(true);
        axiosClient
            .get("/all-tasks", {params: {page, pageSize,...query}})
            .then(({data}) => {
                setLoading(false);
                setTasks(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Manage Tasks";
        getTasks(currentPage, pageSize);
    }, [currentPage, pageSize]);
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };
    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <CommonTable
                cardTitle={"List of Tasks"}
                addBTN={
                    {
                        permission: checkPermission('task_create'),
                        txt: "Add New Task",
                        icon: (<Iconify icon={"eva:plus-fill"}/>), //"faBuildingFlag",
                        linkTo: 'modal',
                        link: handelShowModal
                    }
                }
                paginations={{
                    totalPages: totalPages,
                    totalCount: totalCount,
                    currentPage: currentPage,
                    handlePageChange: handlePageChange
                }}
                table={{
                    size: "small",
                    ariaLabel: 'task table',
                    showIdColumn: userRole === 'admin' ?? false,
                    tableColumns: TABLE_HEAD,
                    tableBody: {
                        loading: loading,
                        loadingColSpan: 10,
                        rows: modifiedTaskData,//rendering data
                    },
                    actionBtn: {
                        showModule: showAsset,
                        deleteFunc: onDelete,
                        params: actionParams,
                        editDropdown: 'task_edit',
                        showPermission: 'task_view',
                        deletePermission: 'task_delete'
                    }
                }}
                filter={{
                    filterByText: true,
                    placeHolderTxt: 'Search Task...',
                    searchBoxValue: searchTerm,
                    handelSearch: setSearchTerm
                }}
            />

            <TaskAddModal showModal={showModal}
                          handelCloseModal={handleCloseModal}
                          title={'Add a new Task'}
                          currentTaskList ={tasks}
                          setTasks = {setTasks}
            />
        </div>
    );
}
