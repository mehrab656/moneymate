import React, {useEffect, useState, useContext} from "react";
import axiosClient from "../../../axios-client.js";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import {Modal} from "react-bootstrap";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import {checkPermission, compareDates} from "../../../helper/HelperFunctions.js";
import SummeryCard from "../../../helper/SummeryCard.jsx";
import {notification} from "../../../components/ToastNotification.jsx";


import Iconify from "../../../components/Iconify.jsx";
import CommonTable from "../../../components/table/CommonTable.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import Image from "react-bootstrap/Image";
import UserFilters from "./UserFilters.jsx";
import UpdateStatus from "../../HRMS/Task/UpdateStatus.jsx";
// Sidebar-based components
import { useSidebarActions } from "../../../hooks/useSidebarActions.js";
import UserFormSidebar from "./UserFormSidebar.jsx";
import UserDetails from "./UserDetails.jsx";
import { Box, Card, Collapse, IconButton } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTheme } from "@mui/material/styles";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";


const defaultUserData = {
    id: '',
    slug: '',
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    emergency_contract: '',
    dob: '',
    gender: '',
    avatar: '',
    role: '',
    active: '',
    profile: '',
    attachment: '',
    options: [],
}
const defaultQuery = {
    orderBy: '',
    order: '',
    limit: '',
    role: '',
}
export default function UserList() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const {applicationSettings, userRole, userPermission} = useContext(SettingsContext);
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState(defaultUserData);
    const [loading, setLoading] = useState(true);
    // Sidebar replaces local modals
    const [query, setQuery] = useState(defaultQuery)
    const theme = useTheme();
    const [showFilter, setShowFilter] = useState(false);
    const {
        num_data_per_page,
    } = applicationSettings;

    const [hasFilter, setHasFilter] = useState(false)
    const TABLE_HEAD = [
        {id: "profile", label: "Avatar", align: "center"},
        {id: "username", label: "User Name", align: "center"},
        {id: "role", label: "Role", align: "center"},
        {id: "gender", label: "Gender", align: "center"},
        {id: "active", label: "Active", align: "center"},
    ];

    const pageSize = Number(query.limit) > 0 ? Number(query.limit) : (num_data_per_page || 10);
    const totalPages = Math.ceil((totalCount || 0) / (pageSize || 10));

    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const modifiedTaskData = filteredUsers.map((user) => {

        user.profile = <Image src={user.avatar} roundedCircle style={{height: '50px', width: '50px'}}/>;
        user.active = <span className={`text-success`}>{user.active}</span>
        user.attachment=''
        return user;
    });

    const onDelete = (user) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover the user !`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient
                    .delete(`user/${user.id}`)
                    .then((data) => {
                        getUsers();
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
    // Sidebar actions
    const { showLargeContent, showQuickDetails } = useSidebarActions();

    const openCreateForm = () => {
        const createRef = React.createRef();
        const formId = "user-form-sidebar-form";
        showLargeContent(
            "Add New User",
            <UserFormSidebar ref={createRef} formId={formId} hideInternalFooter={true} onSuccess={getUsers} />,
            {
                width: "xl",
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            { label: "Save", type: "button", onClick: () => createRef.current?.save() },
                            { label: "Save and Exit", type: "button", onClick: () => createRef.current?.saveAndExit() }
                        ]}
                    />
                )
            }
        );
    };

    const openEditForm = (element) => {
        const editRef = React.createRef();
        const formId = "user-form-sidebar-form";
        showLargeContent(
            "Edit User",
            <UserFormSidebar ref={editRef} formId={formId} hideInternalFooter={true} data={element} onSuccess={getUsers} />,
            {
                width: "xl",
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            { label: "Save", type: "button", onClick: () => editRef.current?.save() },
                            { label: "Save and Exit", type: "button", onClick: () => editRef.current?.saveAndExit() }
                        ]}
                    />
                )
            }
        );
    };

    const openViewDetails = (element) => {
        showQuickDetails(
            "User Details",
            <UserDetails userId={element?.id} data={element} />
        );
    };

    const getUsers = () => {
        setLoading(true);
        axiosClient
            .get("/users", {params: {currentPage, pageSize, ...query}})
            .then(({data}) => {
                setLoading(false);
                setUsers(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Manage Users";
        getUsers();
    }, [currentPage, pageSize, hasFilter]);
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };
    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setQuery((prev) => ({ ...prev, limit: newSize }));
        setCurrentPage(1);
    };
    const resetFilterParameter = () => {
        setQuery(defaultQuery);
        setHasFilter(!hasFilter);
    }
    const handelFilter = () => {
        setHasFilter(!hasFilter);
    }
    const filters = () => {
        return <UserFilters
            search={{
                filterByText: true,
                placeHolderTxt: 'Search by name...',
                searchBoxValue: searchTerm,
                handelSearch: setSearchTerm
            }}
            query={query}
            setQuery={setQuery}
            resetFilterParameter={resetFilterParameter}
        />
    }

    const actionParams = [
        {
            actionName: 'Edit',
            type: "modal",
            route: "",
            actionFunction: openEditForm,
            permission: 'user_edit',
            textClass: 'text-info',
        },
        {
            actionName: 'View',
            type: "modal",
            route: "",
            actionFunction: openViewDetails,
            permission: 'user_view',
            textClass: 'text-warning'
        },
        {
            actionName: 'Delete',
            type: "modal",
            route: "",
            actionFunction: onDelete,
            permission: 'user_delete',
            textClass: 'text-danger'
        }];

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={"page-title-header"}>Users</span>
                {checkPermission("user_create") && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <button className={"btn primary-theme-btn btn-sm ml-2"} onClick={openCreateForm}>
                            <Iconify icon={"eva:plus-fill"} />
                        </button>
                        <IconButton size="small" aria-label="toggle filter" onClick={() => setShowFilter((s) => !s)}>
                            <ArrowDropDownIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>
            <Collapse in={showFilter} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, mb: 2 }}>{filters()}</Box>
            </Collapse>
            <Card
                sx={{
                    p: 5,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    '& .MuiTableContainer-root': { backgroundColor: theme.palette.background.paper },
                    '& .MuiPaper-root': { backgroundColor: theme.palette.background.paper },
                    '& .MuiTableCell-root': { color: theme.palette.text.primary },
                }}
                style={{ padding: "0px" }}
            >
                <CommonTable
                    data={modifiedTaskData}
                    tableColumns={TABLE_HEAD}
                    actionButtons={actionParams}
                    pagination={{
                        totalPages: totalPages ?? 0,
                        totalCount: totalCount,
                        currentPage: currentPage,
                        handlePageChange: handlePageChange,
                        pageSize: pageSize,
                        onRowsPerPageChange: handleRowsPerPageChange,
                    }}
                    cardSubTitle={`Page-${currentPage} (showing ${modifiedTaskData.length} results from ${totalCount})`}
                    isFetching={loading}
                    hasError={false}
                />
            </Card>
        </div>
    );
}
784199660582083
