import {Link} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import Swal from 'sweetalert2';
import IncomeExportButton from "../components/IncomeExportButton.jsx";
import WizCard from "../components/WizCard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDollar, faEdit, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import Pagination from "react-bootstrap/Pagination";
import {SettingsContext} from "../contexts/SettingsContext";
import ActionButtonHelpers from "../helper/ActionButtonHelpers.jsx";
import MainLoader from "../components/MainLoader.jsx";
import {Modal} from "react-bootstrap";
import IncomeModal from "../helper/IncomeModal.jsx";

export default function Incomes() {

    const [loading, setLoading] = useState(false);
    const [incomes, setIncomes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);


    useEffect(() => {
        document.title = "Manage Incomes";
        getIncomes(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const getIncomes = (page, pageSize) => {
        setLoading(true);
        axiosClient.get('/incomes', {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setIncomes(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            })
    }

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

    const filteredIncomes = incomes.filter((income) => {
        return income.user_name.toLowerCase().includes(searchTerm.toLowerCase())
            || income.account_number.toLowerCase().includes(searchTerm.toLowerCase())
            || income.category_name.toLowerCase().includes(searchTerm.toLowerCase())
            || income.amount.toLowerCase().includes(searchTerm.toLowerCase())
            || income.description.toLowerCase().includes(searchTerm.toLowerCase())
            || income.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
    });

    const onDelete = (income) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You will not be able to recover the income !`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.delete(`income/${income.id}`).then(() => {
                    getIncomes();
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Income has been deleted.',
                        icon: 'success',
                    });
                }).catch((error) => {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Income could not be deleted.',
                        icon: 'error',
                    });
                });
            }
        });
    };
    const [showModal, setShowModal] = useState(false);
    const [income, setIncome] = useState({
        id: null,
        user_id: null,
        account_id: '', // Set default value to an empty string
        amount: 0, // Set default value to an empty string
        category_id: null,
        category_name: '',
        description: '',
        reference: '',
        date: '',
        note: '',
        attachment: ''
    });
    const showIncome = (income) => {
        setIncome(income);
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false);
    };
    const actionParams = {
        route:{
            editRoute:'/income/',
            viewRoute:'',
            deleteRoute:''
        },
    }

    return (
        <div>
         <MainLoader loaderVisible={loading} />


            <WizCard className="animated fadeInDown">
                <div className="row">
                    <div className="col-3">
                        <h3>Income </h3>
                    </div>
                    <div className="col-7">
                        <div className="mb-4">
                            <input className="custom-form-control"
                                   type="text"
                                   placeholder="Search Income..."
                                   value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)}/>

                        </div>
                    </div>
                    <div className="col-2">
                        <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                            {userRole === 'admin' &&
                                <Link className="btn-add align-right mr-3" to="/income/new"><FontAwesomeIcon icon={faPlus}/></Link>}
                            <IncomeExportButton/>
                        </div>
                    </div>
                </div>


                <div className="table-responsive-sm">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr className={'text-center'}>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            {userRole === 'admin' && <th width="20%">Action</th>}

                        </tr>
                        </thead>
                        {loading && (
                            <tbody>
                            <tr>
                                <td colSpan={8} className="text-center">
                                    Loading...
                                </td>
                            </tr>
                            </tbody>
                        )}
                        {!loading && (
                            <tbody>
                            {filteredIncomes.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center">
                                        No Income found
                                    </td>
                                </tr>
                            ) : (
                                filteredIncomes.map((income) => (
                                    <tr className={'text-center'} key={income.id}>
                                        <td>{income.date}</td>
                                        <td>{income.description !== 'null' ? income.description : ''}</td>
                                        <td>{income.category_name}</td>
                                        <td>{default_currency + ' ' + income.amount}</td>
                                        {userRole === 'admin' &&
                                            <ActionButtonHelpers 
                                              module={income}
                                              showModule={showIncome}
                                              deleteFunc={onDelete}
                                              params={actionParams}
                                            />
                                        }

                                    </tr>
                                ))
                            )}
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
            <IncomeModal
                showModal={showModal}
                handelCloseModal={handleCloseModal}
                title={'Income Details'}
                data={income}
                currency={default_currency}
            />


        </div>
    )
}
