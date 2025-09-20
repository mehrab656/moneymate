import React, {useEffect, useState, useContext} from "react";
import axiosClient from "../../../axios-client.js";
import Swal from "sweetalert2";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import {checkPermission} from "../../../helper/HelperFunctions.js";
import {notification} from "../../../components/ToastNotification.jsx";
import Iconify from "../../../components/Iconify.jsx";
import CommonTable from "../../../helper/CommonTable.jsx";
import TaskFilters from "../Task/TaskFilters.jsx";
import CreateOrUpdateModal from "./CreateOrUpdateModal.jsx";
import Image from 'react-bootstrap/Image';

const defaultEmployee = {
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    emergency_contact: '',
    joining_date: '',
    role_id: '',
    position: '',
    basic_salary: '',
    accommodation_cost: '',
    profile_picture: '',
    id_copy: '',
    avatar:''
}
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
export default function Employee() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const {applicationSettings, userRole, userPermission} = useContext(SettingsContext);
    const [employeeList, setEmployeeList] = useState([]);
    const [employee, setEmployee] = useState(defaultEmployee);
    const [loading, setLoading] = useState(true);
    const [showCreateOrUpdateModal, setShowCreateOrUpdateModal] = useState(false);

    const [query, setQuery] = useState(defaultQuery)
    const {
        num_data_per_page,
    } = applicationSettings;


    const [hasFilter, setHasFilter] = useState(false)
    const TABLE_HEAD = [
        {id: "avatar", label: "Avatar", align: "left"},
        {id: "name", label: "Name", align: "left"},
        {id: "phone", label: "Phone", align: "left"},
        {id: "position", label: "Designation", align: "left"},
        {id: "joining_date", label: "Joined", align: "left"},
    ];


    const pageSize = Number(query.limit) > 0 ? Number(query.limit) : num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);


    const filteredEmployees = employeeList.filter(
        (employee) =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.emergency_contact.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const modifiedEmployeesData = filteredEmployees.map(({
                                                    id, name, accommodation_cost, attachment, basic_salary, emergency_contact, joining_date, phone, position, avatar
                                                }, index) => {

        const employee ={};
        employee.id = id;
        employee.name = name.charAt(0).toUpperCase() + name.slice(1);
        employee.accommodation_cost = accommodation_cost;
        employee.basic_salary = basic_salary;
        employee.emergency_contact = emergency_contact;
        employee.joining_date = joining_date;
        employee.phone = phone;
        employee.position = position.charAt(0).toUpperCase() + position.slice(1);
        employee.avatar =<Image src={avatar} roundedCircle style={{height:'40px',width:'40px'}}/>
        return employee;
    });
    const onDelete = (employee) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover the employee !`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient
                    .delete(`employee/${employee.id}`)
                    .then((data) => {
                        getEmployees();
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
    const showCreateModalFunc = () => {
        setShowCreateOrUpdateModal(true);
    };
    const closeCreateModalFunc = () => {
        setShowCreateOrUpdateModal(false);
    };

    const getEmployees = () => {
        setLoading(true);
        axiosClient
            .get("/all-employees", {params: {currentPage, pageSize, ...query}})
            .then(({data}) => {
                setLoading(false);
                setEmployeeList(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Manage employees";
        getEmployees();
    }, [currentPage, pageSize, hasFilter]);
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };
    const resetFilterParameter = () => {
        setQuery(defaultQuery);
        setHasFilter(!hasFilter);

    }
    const handelFilter = () => {
        setHasFilter(!hasFilter);
    }
    const filters = () => {
        return <TaskFilters search={{
            filterByText: true,
            placeHolderTxt: 'Search employee...',
            searchBoxValue: searchTerm,
            handelSearch: setSearchTerm
        }}
                            query={query}
                            setQuery={setQuery}
                            resetFilterParameter={resetFilterParameter}
                            getTask={getEmployees}
                            handelFilter={handelFilter}

        />
    }

    const actionParams = [
        {
            actionName: 'Edit',
            type: "modal",
            route: "",
            actionFunction: "editModal",
            permission: 'edit_employee',
            textClass: 'text-info',
        },
        {
            actionName: 'View',
            type: "modal",
            route: "",
            actionFunction: 'showViewModalFunc',
            permission: 'employee_view',
            textClass: 'text-warning'
        },
        {
            actionName: 'Delete',
            type: "modal",
            route: "",
            actionFunction: onDelete,
            permission: 'employee_delete',
            textClass: 'text-danger'
        },
        {
            actionName: 'Update Status',
            type: "modal",
            route: "",
            actionFunction: 'showStatusModalFunc',
            permission: 'employee_change_status',
            textClass: 'text-primary'
        },
        {
            actionName: 'Update Payment',
            type: "modal",
            route: "",
            actionFunction: 'showPaymentModalFunc',
            permission: 'employee_change_payment_status',
            textClass: 'text-info'
        }];

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <CommonTable
                cardTitle={"List of employees"}
                addBTN={
                    {
                        permission: checkPermission('employee_create'),
                        txt: "Add New employee",
                        icon: (<Iconify icon={"eva:plus-fill"}/>), //"faBuildingFlag",
                        linkTo: 'modal',
                        link: showCreateModalFunc
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
                    ariaLabel: 'employee table',
                    showIdColumn: userRole === 'admin' ?? false,
                    tableColumns: TABLE_HEAD,
                    tableBody: {
                        loading: loading,
                        loadingColSpan: 7,
                        rows: modifiedEmployeesData,//rendering data
                    },
                    actionButtons: actionParams
                }}
                filter={filters}
            />

            <CreateOrUpdateModal show={showCreateOrUpdateModal}
                                 closeFunc={closeCreateModalFunc}
            />

        </div>
    );
}
