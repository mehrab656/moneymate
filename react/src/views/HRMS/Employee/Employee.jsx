import React, {useEffect, useState, useContext} from "react";
import axiosClient from "../../../axios-client.js";
import Swal from "sweetalert2";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import {checkPermission} from "../../../helper/HelperFunctions.js";
import {notification} from "../../../components/ToastNotification.jsx";
import Iconify from "../../../components/Iconify.jsx";
import CommonTable from "../../../components/table/CommonTable.jsx";
import EmployeeFormSidebar from "./EmployeeFormSidebar.jsx";
import EmployeeDetails from "./EmployeeDetails.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";
import Image from 'react-bootstrap/Image';
import { Form, InputGroup } from "react-bootstrap";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";
import { createSelectStyles, createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";
import { Box, Collapse, IconButton } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

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
    const [showFilter, setShowFilter] = useState(false);

    const [query, setQuery] = useState(defaultQuery)
    const {
        num_data_per_page,
    } = applicationSettings;
    const theme = useTheme();
    const inputGroupTextStyle = createInputGroupTextStyle(theme);
    const selectStyles = createSelectStyles(theme);
    const isDark = theme.palette.mode === "dark";
    const inputStyle = {
        backgroundColor: isDark ? "#1c1f24" : "#fff",
        color: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        fontSize: "0.875rem",
        minHeight: 36,
    };

    const normalizeText = (v) => String(v ?? "").trim();
    const capitalize = (v) => {
        const s = normalizeText(v);
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
    };

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
            normalizeText(employee.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
            normalizeText(employee.position).toLowerCase().includes(searchTerm.toLowerCase()) ||
            normalizeText(employee.phone).toLowerCase().includes(searchTerm.toLowerCase()) ||
            normalizeText(employee.emergency_contact).toLowerCase().includes(searchTerm.toLowerCase())
    );


    const modifiedEmployeesData = filteredEmployees.map(({
                                                    id, name, accommodation_cost, attachment, basic_salary, emergency_contact, joining_date, phone, position, avatar
                                                }, index) => {

        const employee ={};
        employee.id = id;
        employee.name = capitalize(name);
        employee.accommodation_cost = accommodation_cost;
        employee.basic_salary = basic_salary;
        employee.emergency_contact = normalizeText(emergency_contact);
        employee.joining_date = normalizeText(joining_date);
        employee.phone = normalizeText(phone);
        employee.position = capitalize(position);
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
    const { showLargeContent, showQuickDetails } = useSidebarActions();

    const openCreateForm = () => {
        const createRef = React.createRef();
        const formId = "employee-form-global";
        showLargeContent(
            "Add Employee",
            <EmployeeFormSidebar
                ref={createRef}
                formId={formId}
                onSuccess={getEmployees}
            />,
            {
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            { label: "Save", type: "button", onClick: () => createRef.current?.save() },
                            { label: "Save and Exit", type: "button", onClick: () => createRef.current?.saveAndExit() },
                        ]}
                    />
                ),
            }
        );
    };

    const openEditForm = (element) => {
        const createRef = React.createRef();
        const formId = "employee-form-global";
        showLargeContent(
            "Edit Employee",
            <EmployeeFormSidebar
                ref={createRef}
                employeeId={element.id}
                formId={formId}
                onSuccess={getEmployees}
            />,
            {
                footerActions: (
                    <SidebarFooterButtons
                        actions={[{ label: "Update", type: "button", onClick: () => createRef.current?.saveAndExit() }]}
                    />
                ),
            }
        );
    };

    const openViewDetails = (element) => {
        showQuickDetails(
            "Employee Details",
            <EmployeeDetails employeeId={element.id} />
        );
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
        return (
            <div className="mb-3">
                <div className="d-flex flex-wrap gap-2">
                    <InputGroup className="mb-3" size="sm" style={{ maxWidth: "520px", flex: "1 1 320px" }}>
                        <InputGroup.Text id="employee_search" style={inputGroupTextStyle}>Search</InputGroup.Text>
                        <Form.Control
                            aria-describedby="employee_search"
                            type="text"
                            size="sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search employee..."
                            style={{ ...inputStyle, textTransform: "capitalize" }}
                        />
                    </InputGroup>
                    <InputGroup className="mb-3" size="sm" style={{ maxWidth: "320px", flex: "1 1 220px" }}>
                        <InputGroup.Text id="employee_order" style={inputGroupTextStyle}>Order</InputGroup.Text>
                        <div className="flex-grow-1">
                            <Select
                                classNamePrefix="select"
                                styles={selectStyles}
                                isSearchable={false}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                value={
                                    [{ value: "ASC", label: "Ascending" }, { value: "DESC", label: "Descending" }]
                                        .find((opt) => opt.value === (query?.orderBy || "DESC")) || null
                                }
                                onChange={(opt) => {
                                    setQuery({ ...query, orderBy: opt?.value });
                                    setHasFilter(!hasFilter);
                                }}
                                options={[
                                    { value: "ASC", label: "Ascending" },
                                    { value: "DESC", label: "Descending" },
                                ]}
                            />
                        </div>
                    </InputGroup>
                    <InputGroup className="mb-3" size="sm" style={{ maxWidth: "240px", flex: "1 1 160px" }}>
                        <InputGroup.Text id="employee_limit" style={inputGroupTextStyle}>Limit</InputGroup.Text>
                        <Form.Select
                            aria-describedby="employee_limit"
                            size="sm"
                            value={query.limit || ""}
                            onChange={(e) => {
                                setQuery({ ...query, limit: e.target.value });
                                setCurrentPage(1);
                                setHasFilter(!hasFilter);
                            }}
                        >
                            <option value="">Default</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                        </Form.Select>
                    </InputGroup>
                    <div className="ms-auto">
                        <button className="btn btn-warning btn-sm" type="button" onClick={resetFilterParameter}>
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const actionParams = [
        {
            actionName: 'Edit',
            type: "modal",
            route: "",
            actionFunction: openEditForm,
            permission: 'edit_employee',
            textClass: 'text-info',
        },
        {
            actionName: 'View',
            type: "modal",
            route: "",
            actionFunction: openViewDetails,
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
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={"page-title-header"}>Employees</span>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {checkPermission('employee_create') && (
                        <a className="custom-btn btn-add" onClick={openCreateForm} role="button">
                            Add New
                        </a>
                    )}
                    <IconButton size="small" aria-label="toggle filter" onClick={() => setShowFilter((s) => !s)}>
                        <ArrowDropDownIcon />
                    </IconButton>
                </Box>
            </Box>
            <Collapse in={showFilter} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, mb: 2 }}>
                    {filters()}
                </Box>
            </Collapse>
            <CommonTable
                data={modifiedEmployeesData}
                tableColumns={[
                    ...(userRole === 'admin' ? [{ id: 'id', label: 'ID', align: 'left' }] : []),
                    {id: "avatar", label: "Avatar", align: "left"},
                    {id: "name", label: "Name", align: "left"},
                    {id: "phone", label: "Phone", align: "left"},
                    {id: "position", label: "Designation", align: "left"},
                    {id: "joining_date", label: "Joined", align: "left"},
                ]}
                actionButtons={actionParams}
                pagination={{
                    totalPages: totalPages || 0,
                    totalCount: totalCount,
                    total: totalCount,
                    currentPage: currentPage,
                    handlePageChange: (e, value) => setCurrentPage(value),
                    pageSize: pageSize,
                    onRowsPerPageChange: (event) => {
                        const newSize = parseInt(event.target.value, 10);
                        if (newSize > 0) {
                            setQuery(prev => ({ ...prev, limit: newSize }));
                            setCurrentPage(1);
                        }
                    },
                }}
                cardSubTitle={`Page-${currentPage} • ${modifiedEmployeesData.length} of ${totalCount}`}
                isFetching={loading}
                hasError={false}
            />
            {/* Sidebars handle create/edit/view; legacy modal removed */}
        </div>
    );
}
