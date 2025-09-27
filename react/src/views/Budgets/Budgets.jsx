import {Link} from "react-router-dom";
import axiosClient from "../../axios-client.js";
import React, {useContext, useEffect, useState} from "react";
import Swal from 'sweetalert2';
import WizCard from "../../components/WizCard.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faMoneyBill, faTrash} from "@fortawesome/free-solid-svg-icons";
import Pagination from "react-bootstrap/Pagination";
import {Button, Modal} from "react-bootstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import {useStateContext} from "../../contexts/ContextProvider.jsx";
import {SettingsContext} from "../../contexts/SettingsContext.jsx";
import ActionButtonHelpers from "../../helper/ActionButtonHelpers.jsx";
import MainLoader from "../../components/loader/MainLoader.jsx";
import { notification } from "../../components/ToastNotification.jsx";
import BudgetFormSidebar from "./BudgetFormSidebar.jsx";
import { useSidebarActions } from "../../hooks/useSidebarActions";

export default function Budgets() {

    const { showQuickDetails } = useSidebarActions();


    const [loading, setLoading] = useState(false);
    const [budgets, setBudgets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const {applicationSettings,userRole} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);
    const filteredBudgets = budgets.filter(
        (budget) =>
            budget.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
            budget.budget_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [errors, setErrors] = useState({});
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [budgetOverlap, setBudgetOverlap] = useState(null);

    const handleStartDateChange = (date) => {
        setStartDate(date);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
    };

    const [showModal, setShowModal] = useState(false);

    const [budget, setBudget] = useState({
        id: null,
        budget_name: "",
        amount: "",
        start_date: null, // Update here
        end_date: null,
        use_id: null,
    });

    const {setNotification} = useStateContext();

    const getExpenseCategories = () => {
        setLoading(true);
        axiosClient
            .get("/expense-categories")
            .then(({data}) => {
                setExpenseCategories(data.categories);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.error("Error loading expense categories:", error);
            });
    };

    const getBudgets = (page, pageSize) => {
        setLoading(true);
        axiosClient.get('/budgets', {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setBudgets(data.data);
                setTotalCount(data.total);
            }).catch((error) => {
            setLoading(false);
        });
    }

    useEffect(() => {
        document.title = "Manage Budget";
        getBudgets(currentPage, pageSize);
        getExpenseCategories();
    }, [currentPage]);


    const showCreateModal = () => {
        setBudget({
            id: null,
            budget_name: "",
            amount: "",
            start_date: "",
            end_date: "",
            use_id: null,
        });
        setSelectedCategories([]);
        setErrors({});
        setShowModal(true);
    };

    const showCreateSidebar = () => {
        showQuickDetails(
            "Create New Budget",
            <BudgetFormSidebar onSuccess={() => getBudgets(currentPage, pageSize)} />
        );
    };

    const showEditSidebar = (budgetId) => {
        showQuickDetails(
            "Update Budget",
            <BudgetFormSidebar 
                budgetId={budgetId}
                onSuccess={() => getBudgets(currentPage, pageSize)} 
            />
        );
    };

    const edit = (budget) => {
        setBudget(budget);
        setSelectedCategories(
            budget.categories.map((selectedCategory) => ({
                value: selectedCategory.id,
                label: selectedCategory.name,
            }))
        );
        setStartDate(new Date(budget.start_date)); // Add this line
        setEndDate(new Date(budget.end_date));
        setErrors({});
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSelectChange = (selectedOptions) => {
        setSelectedCategories(selectedOptions);
    };

     // set default date(today)
     useEffect(()=>{
        if(startDate ===null){
            setStartDate(new Date())
            }
       },[startDate])


    const budgetSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const updatedBudget = {
            ...budget,
            start_date: startDate ? new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString().split("T")[0] : null,
            end_date: endDate ? new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().split("T")[0] : null,
            categories: selectedCategories.map((category) => category.value),
        };


        if (budget.id) {
            axiosClient
                .put(`/budgets/${budget.id}`, updatedBudget)
                .then(({data}) => {
                    // setNotification(`${data.budget_name} was successfully updated`);
                    getBudgets(currentPage, pageSize);
                    setShowModal(false);
                    setBudget({
                        id: null,
                        budget_name: "",
                        amount: "",
                        start_date: "",
                        end_date: "",
                        use_id: null,
                    });

                    notification('success',data?.message,data?.description)
                    setLoading(false);
                })
                .catch((err) => {
                    // const response = error.response;
                    // if (response && response.status === 422) {
                    //     setErrors(response.data.errors);
                    // }
                    if (err.response) { 
                        const error = err.response.data
                        notification('error',error?.message,error.description)
                    }
                    setLoading(false);
                });
        } else {
            axiosClient
                .post("/budgets", updatedBudget)
                .then(({data}) => {
                    if (data && data.status === 422) {
                        // setNotification(data.message);
                    } else {
                        // setNotification(`${data.budget_name} was successfully created`);
                        getBudgets(currentPage, pageSize);
                        setShowModal(false);
                        setBudget({
                            id: null,
                            budget_name: "",
                            amount: "",
                            start_date: "",
                            end_date: "",
                            use_id: null,
                        });
                    }

                    notification('success',data?.message,data?.description)

                    setLoading(false);
                })
                .catch((err) => {
                    if (err.response) { 
                        const error = err.response.data
                        notification('error',error?.message,error.description)
                    }
                    setLoading(false);
                });
        }
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


    const onDelete = (budget) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You will not be able to recover the budget ${budget.budget_name}!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.delete(`budgets/${budget.id}`).then(() => {
                    getBudgets();
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Budget has been deleted.',
                        icon: 'success',
                    });
                }).catch((error) => {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Budget could not be deleted.'+error,
                        icon: 'error',
                    });
                });
            }
        });
    };



    const actionParams = [
        {
            actionName: 'Edit',
            type: "modal",
            route: "",
            actionFunction: (budget) => showEditSidebar(budget.id),
            permission: 'budget_edit',
            textClass:'text-info',
        },
        {
            actionName: 'View',
            type: "modal",
            route: "",
            actionFunction: showModal,
            permission: 'budget_view',
            textClass:'text-warning'
        },
        {
            actionName: 'Delete',
            type: "modal",
            route: "",
            actionFunction: onDelete,
            permission: 'budget_delete',
            textClass:'text-danger'
        },
    ];
    return (
        <>
        <MainLoader loaderVisible={loading} />
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Budgets</h1>
                <Link className="btn-add" onClick={showCreateSidebar}><FontAwesomeIcon icon={faMoneyBill}/> Add New Budget</Link>
            </div>
            <WizCard className="animated fadeInDown">
                <div className="mb-4">
                    <input className="custom-form-control"
                           type="text"
                           placeholder="Search budget..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="table-responsive-sm">
                    <table className="table-bordered custom-table">
                        <thead>
                        <tr className={'text-center'}>
                            {
                                userRole === 'admin'&&
                                <th>id</th>
                            }
                            <th>BUDGET NAME</th>
                            <th>PROPOSED AMOUNT</th>
                            <th>UPDATED BUDGET AMOUNT</th>
                            <th>BUDGET START DATE</th>
                            <th>BUDGET END DATE</th>
                            {userRole ==='admin' && <th width="20%">ACTIONS</th>}
                            
                        </tr>
                        </thead>
                        {loading && (
                            <tbody>
                            {filteredBudgets.length === 0}
                            <tr>
                                <td colSpan={6} className="text-center">
                                    Loading...
                                </td>
                            </tr>
                            </tbody>
                        )}
                        {!loading && (
                            <tbody>
                            {filteredBudgets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center">
                                        No budget found
                                    </td>
                                </tr>
                            ) : (
                                filteredBudgets.map((budget) => (
                                    <tr className={'text-center'} key={budget.id}>
                                        {
                                            userRole === 'admin'&&
                                            <td>{budget.id}</td>
                                        }
                                        <td>{budget.budget_name}</td>
                                        <td>{default_currency + budget.amount}</td>
                                        <td>{default_currency + budget.updated_amount}</td>
                                        <td>{budget.start_date}</td>
                                        <td>{budget.end_date}</td>
                                        {userRole ==='admin' && 
                                         <td>
                                             <ActionButtonHelpers
                                                 actionBtn={actionParams}
                                                 element={budget}
                                             />
                                        </td>}
                                       
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

                        {budget.id && <span>Update Budget: {budget.budget_name}</span>}
                        {!budget.id && <span>Add New Budget</span>}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label className="custom-form-label" htmlFor="budget_name">Budget Name</label>
                        <input
                            className={`custom-form-control ${errors.budget_name ? "has-error" : ""}`}
                            value={budget.budget_name}
                            onChange={(e) => setBudget({...budget, budget_name: e.target.value})}
                            placeholder="Budget Name"
                        />
                        {errors.budget_name && <p className="error-message mt-2">{errors.budget_name[0]}</p>}
                    </div>

                    <div className="form-group">
                        <label className="custom-form-label" htmlFor="budget_amount">Budget Amount</label>
                        <input
                            className={`custom-form-control ${errors.amount ? "has-error" : ""}`}
                            value={budget.amount}
                            onChange={(e) => setBudget({...budget, amount: e.target.value})}
                            placeholder="Budget Amount"
                        />
                        {errors.amount && <p className="error-message mt-2">{errors.amount[0]}</p>}
                    </div>

                    <div className="form-group">
                        <label className="custom-form-label" htmlFor="expense_categories">Expense
                            Categories</label>
                        <Select
                            isMulti
                            value={selectedCategories}
                            options={expenseCategories.map((category) => ({
                                value: category.id,
                                label: category.name,
                            }))}
                            onChange={handleSelectChange}
                        />
                        {errors.categories && <p className="error-message mt-2">{errors.categories[0]}</p>}
                    </div>

                    <div className="form-group">
                        <label className="custom-form-label" htmlFor="start_date">Start Date</label>
                        <DatePicker
                            className="custom-form-control"
                            selected={startDate}
                            onChange={handleStartDateChange}
                            onSelect={handleStartDateChange}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Start Date"
                        />
                        {errors.start_date && <p className="error-message mt-2">{errors.start_date[0]}</p>}
                    </div>

                    <div className="form-group">
                        <label className="custom-form-label" htmlFor="end_date">End Date</label>
                        <DatePicker
                            className="custom-form-control"
                            selected={endDate}
                            onChange={handleEndDateChange}
                            onSelect={handleEndDateChange}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="End Date"
                        />
                        {errors.end_date && <p className="error-message mt-2">{errors.end_date[0]}</p>}
                    </div>

                    {budgetOverlap && (
                        <div className="text-danger mt-2 mb-3">{budgetOverlap}</div>
                    )}

                </Modal.Body>
                <Modal.Footer>

                    <Button className="btn-sm" variant="primary" onClick={budgetSubmit}>
                        Save
                    </Button>
                    <Button className="btn-sm" variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    )
}
