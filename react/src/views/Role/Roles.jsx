import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {makeStyles} from "@mui/styles";
import {TablePagination} from "@mui/material";
import axiosClient from "../../axios-client.js";
import {useContext, useEffect, useState} from "react";

import {styled} from '@mui/material/styles';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import ActionButtonHelpers from "../../helper/ActionButtonHelpers.jsx";
import Swal from "sweetalert2";
import {notification} from "../../components/ToastNotification.jsx";
import {Tooltip} from "react-tooltip";
import {SettingsContext} from "../../contexts/SettingsContext.jsx";
import {checkPermission} from "../../helper/HelperFunctions.js";
const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 440,
    },
});
export default function Roles() {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(20);
    const {userPermission} = useContext(SettingsContext);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const getRoles = (page, rowsPerPage) => {
        setLoading(true);
        axiosClient.get('/roles', {params: {page, rowsPerPage}})
            .then(({data}) => {
                setLoading(false);
                setRoles(data.data);
            })
            .catch(() => {
                setLoading(false);
            })
    }

    useEffect(() => {
        document.title = "Role list";
        getRoles(page, rowsPerPage);
    }, [page, rowsPerPage]);
    const StyledTableCell = styled(TableCell)(({theme}) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: "#1E1E2D",
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));
    let dateOptions = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const showRole = (sector) => {
        axiosClient(`/sectorsIncomeExpense/${sector.id}`).then(({data}) => {
            // setIncomeExpense(data);
        }).catch(e => {
            console.warn(e)
        })
        // setModalSector(sector);
        // setShowModal(true);
    };

    const onDelete = (role) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover the role !`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient
                    .delete(`role/${role.id}`)
                    .then((data) => {
                        getRoles(page, rowsPerPage);
                        notification('success', data?.message, data?.description)
                    })
                    .catch(err => {
                        if (err.response) {
                            const error = err.response.data
                            notification('error', error?.message, error.description)
                        }
                    })
            }
        });
    };



    const actionParams = {
        route: {
            editRoute: "/role/",
            viewRoute: "",
            deleteRoute: "",
        },
    };
    return (
        <Paper sx={{width: '100%', overflow: 'hidden'}} >
            <div className="row p-3">
                <div className="col-3">
                    <h3>Role List</h3>
                </div>
                <div className="col-7">
                    <div className="mb-4">
                        <input className="custom-form-control"
                               type="text"
                               placeholder="Search Roles"
                               value={searchTerm}
                               data-tooltip-id='search-role'
                               data-tooltip-content={"Search Role by role name or added by user name"}
                               onChange={(e) => setSearchTerm(e.target.value)}/>
                        <Tooltip id='search-role'/>

                    </div>
                </div>
                <div className="col-2">
                    { checkPermission(userPermission.role_create) &&
                        <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                            <Link className="btn-add align-right mr-3"
                                  to="/roles/new"
                                  data-tooltip-id='add-role'
                                  data-tooltip-content={"Add New Role"}><FontAwesomeIcon
                                icon={faPlus}/></Link>
                            <Tooltip id='add-role'/>
                        </div>
                    }
                </div>
            </div>

            <TableContainer component={Paper}>
                <Table aria-label="Roles Table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell><b>Role</b></StyledTableCell>
                            <StyledTableCell><b>Status</b></StyledTableCell>
                            <StyledTableCell><b>Added By</b></StyledTableCell>
                            <StyledTableCell><b>Date</b></StyledTableCell>
                            <StyledTableCell><b>Last Modified Date</b></StyledTableCell>
                            <StyledTableCell><b>Last Modified By</b></StyledTableCell>
                            <StyledTableCell><b>Actions</b></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow
                                key={role.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>{role.role}</TableCell>
                                <TableCell >{role.status===1?"Active":"Inactive"}</TableCell>
                                <TableCell >{role.added_by}</TableCell>
                                <TableCell >{(new Date(role.added_date)).toLocaleDateString("en-US", dateOptions)}</TableCell>
                                <TableCell >{(new Date(role.modified_date)).toLocaleDateString("en-US", dateOptions)}</TableCell>
                                <TableCell >{role.modified_by}</TableCell>
                                <TableCell >
                                    <ActionButtonHelpers
                                        module={role}
                                        showModule={showRole}
                                        deleteFunc={(e)=>{onDelete(role)}}
                                        params={actionParams}
                                        editDropdown={userPermission.role_edit}
                                        showPermission={userPermission.role_view}
                                        deletePermission={userPermission.role_delete}/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[20, 50, 500]}
                component="div"
                count={roles.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

        </Paper>

    );
}
