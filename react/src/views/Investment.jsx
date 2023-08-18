import {Link} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import Swal from "sweetalert2";
import ExpenseExportButton from "../components/ExpenseExportButton.jsx";
import WizCard from "../components/WizCard.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faMinus, faTrash} from "@fortawesome/free-solid-svg-icons";
import Pagination from "react-bootstrap/Pagination";
import DownloadAttachment from "../components/DownloadAttachment.jsx";
import {SettingsContext} from "../contexts/SettingsContext.jsx";
import ActionButtonHelpers from "../helper/ActionButtonHelpers.jsx";
import { Modal } from "react-bootstrap";


export default function Investment() {
    const [loading, setLoading] = useState(false);
    const [investments, setInvestments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [modalInvest, setModalInvest] = useState(false)
    const [showModal, setShowModal] = useState(false);

    const [name, setName] = useState(null) 

    const {applicationSettings} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    const showInvestment = (invest) => {
        setModalInvest(invest);
        setShowModal(true);
        console.log(invest)
    }
    const handleCloseModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        document.title = "Manage Investments";
        getInvestments(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const getInvestments = (page, pageSize) => {
        setLoading(true);
        axiosClient.get('/investments', {params: {page, pageSize}})
            .then(({data}) => {
                console.log(data.data);
                setLoading(false);
                setInvestments(data.data);
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

    // const filteredInvestments = investments.filter((investment) => {

    //     return investment.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    //         || investment.account_id.toLowerCase().includes(searchTerm.toLowerCase())
    //         || investment.amount.toLowerCase().includes(searchTerm.toLowerCase())
    // });


    const onDelete = (investment) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You will not be able to recover the investment !`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.delete(`investment/${investment.id}`).then((res) => {
                    console.log('ress', res)
                    getInvestments();
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'investment has been deleted.',
                        icon: 'success',
                    });
                }).catch((error) => {
                    console.log(error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'investment could not be deleted.',
                        icon: 'error',
                    });
                });
            }
        });
    };

    // get all users
    useEffect(()=>{
        if(name ===null){
            setLoading(true)
            axiosClient.get('/get-all-users')
            .then(({data}) => {
                setLoading(false)
                setUsers(data.data);
                if(data.data.length>0){
                    data.data.forEach(element => {
                        
                    });
                }
            })
            .catch(error => {
                setLoading(false)
                console.error('Error loading investment user:', error);
                // handle error, e.g., show an error message to the user
            });
        }
    },[])

    const actionParams = {
        route:{
            editRoute:'/investment/',
            viewRoute:'',
            deleteRoute:''
        },
    }

    console.log('modal invest', modalInvest)

    console.log('investments', investments)


    return (
        <div>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Investments Histories</h1>
                <Link className="btn-add align-right mr-3" to="/investments/new"><FontAwesomeIcon icon={faMinus}/> Add
                    New</Link>
                <ExpenseExportButton/>
            </div>

            <WizCard className="animated fadeInDown">
                <div className="mb-4">
                    <input className="custom-form-control"
                           type="text"
                           placeholder="Search Investment..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
                <div className="table-responsive">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr className={'text-center'}>
                            <th>ID</th>
                            <th>Investor Name</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Added By</th>
                            <th width="20%">Action</th>
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
                            {investments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center">
                                        No Investments found
                                    </td>
                                </tr>
                            ) : (
                                investments.map((investment) => (
                                    <tr className={'text-center'} key={investment.id}>
                                        <td>{investment.id}</td>
                                        <td>{investment.user_id}</td>
                                        <td>{investment.amount}</td>
                                        <td>{investment.investment_date}</td>
                                        <td>{investment.user_id}</td>
                                        {/* <td>
                                            <Link className="btn-edit" to={"/investment/" + investment.id}>
                                                <FontAwesomeIcon icon={faEdit}/> Edit
                                            </Link>
                                            &nbsp;
                                            <a onClick={() => onDelete(investment)} className="btn-delete"><FontAwesomeIcon
                                                icon={faTrash}/> Delete</a>
                                        </td> */}

                                        <td>
                                            <ActionButtonHelpers module={investment}
                                                                 showModule={showInvestment}
                                                                 deleteFunc={onDelete}
                                                                 params={actionParams}
                                            />
                                        </td>
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


            
            <Modal show={showModal} centered onHide={handleCloseModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>Investment Details</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className="footable table table-bordered table-striped mb-0">
                        <thead></thead>
                        <tbody>
                        <tr>
                            <td width="50%">
                                <strong>Investor Name :</strong>
                            </td>
                            <td>{modalInvest?.user_id}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Account Number :</strong>
                            </td>
                            <td> {modalInvest?.account_id}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Investment Amount :</strong>
                            </td>
                            <td> ${modalInvest?.amount}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Note :</strong>
                            </td>
                            <td>{modalInvest?.note}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Date :</strong>
                            </td>
                            <td>
                              {modalInvest?.investment_date}
                            </td>
                        </tr>
                       
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={handleCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
