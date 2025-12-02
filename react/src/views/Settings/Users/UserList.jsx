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
import CommonTable from "../../../helper/CommonTable.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import Image from "react-bootstrap/Image";
import UserFilters from "./UserFilters.jsx";
import UpdateStatus from "../../HRMS/Task/UpdateStatus.jsx";
// Sidebar-based components
import { useSidebarActions } from "../../../hooks/useSidebarActions.js";
import UserFormSidebar from "./UserFormSidebar.jsx";
import UserDetails from "./UserDetails.jsx";


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

    const pageSize = Number(query.limit) > 0 ? Number(query.limit) : num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

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
        showLargeContent(
            "Add New User",
            <UserFormSidebar onSuccess={getUsers} />,
            { width: "xl" }
        );
    };

    const openEditForm = (element) => {
        showLargeContent(
            "Edit User",
            <UserFormSidebar data={element} onSuccess={getUsers} />,
            { width: "xl" }
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
    const resetFilterParameter = () => {
        setQuery(defaultQuery);
        setHasFilter(!hasFilter);
    }
    const handelFilter = () => {
        setHasFilter(!hasFilter);
    }
    const filters = () => {
        return <UserFilters search={{
            filterByText: true,
            placeHolderTxt: 'Search Task...',
            searchBoxValue: searchTerm,
            handelSearch: setSearchTerm
        }}
                            query={query}
                            setQuery={setQuery}
                            resetFilterParameter={resetFilterParameter}
                            getUser={getUsers}
                            handelFilter={handelFilter}

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
            <CommonTable
                cardTitle={"List of Users"}
                addBTN={{
                    permission: checkPermission('user_create'),
                    txt: "Add New User",
                    icon: (<Iconify icon={"eva:plus-fill"}/>),
                    linkTo: 'modal',
                    link: openCreateForm,
                }}
                paginations={{
                    totalPages: totalPages,
                    totalCount: totalCount,
                    currentPage: currentPage,
                    handlePageChange: handlePageChange
                }}
                table={{
                    size: "small",
                    ariaLabel: 'user table',
                    showIdColumn: userRole === 'admin' ?? false,
                    tableColumns: TABLE_HEAD,
                    tableBody: {
                        loading: loading,
                        loadingColSpan: 6,
                        rows: modifiedTaskData,//rendering data
                    },
                    actionButtons: actionParams
                }}
                filter={filters}
            />
            {/* Sidebar-powered UI replaces local modals */}



        </div>
    );
}
784199660582083