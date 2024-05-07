import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {useContext, useEffect, useState} from "react";
import {SettingsContext} from "../../contexts/SettingsContext.jsx";
import {Link, useNavigate} from "react-router-dom";
import axiosClient from "../../axios-client.js";
import ActionButtonHelpers from "../../helper/ActionButtonHelpers.jsx";
import Swal from "sweetalert2";
import MainLoader from "../../components/MainLoader.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBuildingFlag} from "@fortawesome/free-solid-svg-icons";
import CompanyViewModal from "../Company/CompanyViewModal.jsx";


export default function companies() {

    const [companies, setCompanies] = useState([]);
    const [company, setCompany] = useState({
        id: null,
        name: null,
        phone: null,
        email: null, // Set default value to an empty string
        address: null, // Set default value to an empty string
        activity: null,
        license_no: null,
        issue_date: null,
        expiry_date: null,
        registration_number: null,
        extra: null,
        logo: null,
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {num_data_per_page} = applicationSettings;
    const navigate = useNavigate();

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    useEffect(() => {
        document.title = "Manage Companies";
        getCompanies(currentPage, pageSize);
    }, [currentPage, pageSize]);


    const getCompanies = (page, pageSize) => {
        setLoading(true);
        axiosClient.get('/companies', {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setCompanies(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            })
    };
    const actionParams = {
        route: {
            editRoute: '/company/',
            viewRoute: '',
            deleteRoute: ''
        },
    }
    const onDelete = (u) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert the deletion of company ${u.name}!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.delete(`/company/${u.uid}`)
                    .then(() => {
                        getCompanies();
                        Swal.fire(
                            'Deleted!',
                            'Your company has been deleted.',
                            'success'
                        )
                    })
            }
        })
    };
    const showCompany = (company) => {
        setCompany(company);
        setShowModal(true);
    }
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => {
        setShowModal(false);
    };
    return (

        <div>
            <MainLoader loaderVisible={loading}/>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">List of Companes</h1>
                {userRole === 'admin' && <div>
                    <Link className="custom-btn btn-add" to="/company/add">
                        <FontAwesomeIcon icon={faBuildingFlag}/> Add New
                    </Link>
                </div>}

            </div>
            <TableContainer component={Paper}>
                <Table size="small" aria-label="company table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Company Name</TableCell>
                            <TableCell align="right">Manager</TableCell>
                            <TableCell align="right">Active Sector</TableCell>
                            <TableCell align="right">Account Balance</TableCell>
                            <TableCell align="right">Status</TableCell>
                            {userRole === 'admin' &&
                                <TableCell align="right">Action</TableCell>
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            loading ?
                                <>
                                    <TableRow>
                                        <TableCell scope="row" style={{textAlign: "center"}}
                                                   colSpan={6}>{"Loading..."}</TableCell>
                                    </TableRow>

                                </> : (
                                    companies?.map((company) => (
                                        <TableRow key={company.uid}>
                                            <TableCell component="th" scope="row">{company.name}</TableCell>
                                            <TableCell align="right">{company.phone}</TableCell>
                                            <TableCell align="right">{company.issue_date}</TableCell>
                                            <TableCell align="right">{company.license_no}</TableCell>
                                            <TableCell align="right">{company?.status}</TableCell>
                                            {userRole === 'admin' &&

                                                <TableCell align="right">
                                                    <ActionButtonHelpers
                                                        module={company}
                                                        showModule={showCompany}
                                                        deleteFunc={onDelete}
                                                        params={actionParams}/>
                                                </TableCell>
                                            }

                                        </TableRow>
                                    )))
                        }
                    </TableBody>
                </Table>
            </TableContainer>

            <CompanyViewModal
                showModal={showModal}
                handelCloseModal={handleCloseModal}
                title={'Company Details'}
                data={company}
            />
        </div>
    )
}
