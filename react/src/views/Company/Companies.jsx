import * as React from 'react';
import {useContext, useEffect, useState} from "react";
import {SettingsContext} from "../../contexts/SettingsContext.jsx";
import axiosClient from "../../axios-client.js";
import Swal from "sweetalert2";
import MainLoader from "../../components/MainLoader.jsx";
import {faBuildingFlag} from "@fortawesome/free-solid-svg-icons";
import CompanyViewModal from "../Company/CompanyViewModal.jsx";
import {checkPermission} from "../../helper/HelperFunctions.js";
import CommonTable from "../../helper/CommonTable.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


const _initialCompanyData = {
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
};
export default function companies() {

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const {applicationSettings, userRole, userPermission} = useContext(SettingsContext);
    const [companies, setCompanies] = useState([]);
    const [company, setCompany] = useState(_initialCompanyData);
    const [loading, setLoading] = useState(true);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;
    const TABLE_HEAD = [
        { id: "name", label: "Name", align: "left" },
        { id: "phone", label: "Phone", align: "left" },
        { id: "issue_date", label: "Issue Date", align: "left" },
        { id: "license_no", label: "License No.", align: "left" },
        { id: "activity", label: "Activity", align: "left" },
    ];


    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);
    const actionParams = {
        route: {
            editRoute: '/company/',
            viewRoute: '',
            deleteRoute: ''
        },
    }

    const filteredCompanies = companies.filter(
        (company) =>
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.license_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.activity.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

    useEffect(() => {
        document.title = "Company List";
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

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <CommonTable
                cardTitle={"List of Companies"}
                addBTN={
                    {
                        permission: checkPermission(userPermission.company_create),
                        txt: "Create New",
                        icon:(<FontAwesomeIcon icon={faBuildingFlag}/>), //"faBuildingFlag",
                        link:"/company/add",
                        linkTo:'route'

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
                    ariaLabel: 'company table',
                    showIdColumn: userRole === 'admin' ?? false,
                    tableColumns: TABLE_HEAD,
                    tableBody: {
                        loading: loading,
                        loadingColSpan: 6, //Table head length + 1
                        rows: filteredCompanies,//rendering data
                    },
                    actionBtn: {
                        module: company,
                        showModule: showCompany,
                        deleteFunc: onDelete,
                        params: actionParams,
                        editDropdown: userPermission.company_edit,
                        showPermission: userPermission.company_view,
                        deletePermission: userPermission.company_delete
                    }
                }}
                filter={{
                    filterByText:true,
                    placeHolderTxt:'Search by Company Name,Activity etc...',
                    searchBoxValue:searchTerm,
                    handelSearch: setSearchTerm
                }}
            />
            <CompanyViewModal
                showModal={showModal}
                handelCloseModal={handleCloseModal}
                title={'Company Details'}
                data={company}
            />
        </div>
    )
}
