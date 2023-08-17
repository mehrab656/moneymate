import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link, useNavigate} from "react-router-dom";
import Swal from 'sweetalert2';
import WizCard from "../components/WizCard";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit, faTrash, faUser} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../contexts/SettingsContext";
import Pagination from "react-bootstrap/Pagination";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {num_data_per_page} = applicationSettings;

    const navigate = useNavigate();

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    useEffect(() => {
        document.title = "Manage Users";
        getUsers(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const onDelete = (u) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert the deletion of user ${u.name}!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.delete(`/users/delete/${u.id}`)
                    .then(() => {
                        getUsers();
                        Swal.fire(
                            'Deleted!',
                            'Your user has been deleted.',
                            'success'
                        )
                    })
            }
        })
    };

    const getUsers = (page, pageSize) => {
        setLoading(true);
        axiosClient.get('/users', {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setUsers(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            })
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const paginationItems = [];
    for (let i = 1; i <= totalPages; i++) {
        paginationItems.push(
            <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => handlePageChange(i)}>
                {i}
            </Pagination.Item>
        );
    }

    useEffect(() => {
        if (userRole === "user") {
            navigate("/dashboard");
        }
    }, [userRole, navigate]);

    return (
        <div>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">List of users</h1>
                <div>
                    <Link className="custom-btn btn-add" to="/users/new">
                        <FontAwesomeIcon icon={faUser}/> Add New
                    </Link>
                </div>
            </div>

            <WizCard className="animated fadeInDown">
                <div className="search-box mb-4">
                    <input
                        className="custom-form-control"
                        type="text"
                        placeholder="Search User..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="table-responsive">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>NAME</th>
                            <th className="text-center">EMAIL</th>
                            <th className="text-center">DATE CREATED</th>
                            <th className="text-center">ACTIONS</th>
                        </tr>
                        </thead>

                        {loading ? (
                            <tbody>
                            <tr>
                                <td colSpan={5} className="text-center">Loading....</td>
                            </tr>
                            </tbody>
                        ) : (
                            <tbody>
                            {users.filter(u => {
                                const searchableFields = [u.id, u.name, u.email, u.created_at];
                                return searchableFields.some(field => field.toString().toLowerCase().includes(searchQuery.toLowerCase()));
                            }).map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.name}</td>
                                    <td className="text-center">{u.email}</td>
                                    <td className="text-center">{u.created_at}</td>
                                    <td className="text-center">
                                        <div className="d-flex flex-wrap justify-content-center gap-2">
                                            <span><Link className="btn-edit" to={'/users/' + u.id}><FontAwesomeIcon
                                                icon={faEdit}/> Edit</Link></span>

                                            {u.is_active_membership === 'no' && u.role_as === 'user' &&

                                            <span><a onClick={e => onDelete(u)} className="btn-delete"><FontAwesomeIcon
                                                icon={faTrash}/> Delete </a></span>
                                            }


                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        )}
                    </table>
                </div>

                {totalPages > 1 && (
                    <Pagination>
                        <Pagination.Prev
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        />
                        {paginationItems}
                        <Pagination.Next
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        />
                    </Pagination>
                )}
            </WizCard>
        </div>
    );
}
