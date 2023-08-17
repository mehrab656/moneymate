import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import axiosClient from "../axios-client.js";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import WizCard from "../components/WizCard";

export default function BudgetForm() {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const [budget, setBudget] = useState({
        id: null,
        budget_name: "",
        amount: "",
        start_date: "",
        end_date: "",
        use_id: null,
    });

    const {setNotification} = useStateContext();
    let {id} = useParams();

    const getExpenseCategories = () => {
        axiosClient
            .get("/expense-categories")
            .then(({data}) => {
                setExpenseCategories(data.categories);
            })
            .catch((error) => {
                console.error("Error loading expense categories:", error);
            });
    };

    useEffect(() => {
        getExpenseCategories();
    }, []);

    if (id) {
        useEffect(() => {
            setLoading(true);
            axiosClient
                .get(`/budgets/${id}`)
                .then(({data}) => {
                    setLoading(false);
                    setBudget(data);
                    setSelectedCategories(
                        data.categories.map((selectedCategory) => ({
                            value: selectedCategory.id,
                            label: selectedCategory.name,
                        }))
                    );
                })
                .catch((error) => {
                    setLoading(true);
                    console.log("Unable to load budget", error);
                });
        }, []);
    }

    const handleSelectChange = (selectedOptions) => {
        setSelectedCategories(selectedOptions);
    };

    const budgetSubmit = (e) => {
        e.preventDefault();

        const updatedBudget = {
            ...budget,
            categories: selectedCategories.map((category) => category.value),
        };

        if (budget.id) {
            axiosClient
                .put(`/budgets/${budget.id}`, updatedBudget)
                .then(({data}) => {
                    setNotification(`${data.budget_name} was successfully updated`);
                    navigate("/budgets");
                })
                .catch((error) => {
                    const response = error.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        } else {
            axiosClient
                .post("/budgets", updatedBudget)
                .then(({data}) => {
                    setNotification(`${data.budget_name} was successfully created`);
                    navigate("/budgets");
                })
                .catch((error) => {
                    const response = error.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                {budget.id && <h1 className="title-text mb-0">Update Budget: {budget.budget_name}</h1>}
                {!budget.id && <h1 className="title-text mb-0">Add New Budget</h1>}
            </div>
            <WizCard className="animated fadeInDown wiz-card-mh">
                {loading && <div className="text-center">Loading...</div>}
                {!loading && (
                    <form onSubmit={budgetSubmit}>
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
                                selected={budget.start_date ? new Date(budget.start_date) : null}
                                onChange={(date) =>
                                    setBudget({...budget, start_date: date ? date.toISOString().split("T")[0] : ""})
                                }
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Start Date"
                            />
                            {errors.start_date && <p className="error-message mt-2">{errors.start_date[0]}</p>}
                        </div>

                        <div className="form-group">
                            <label className="custom-form-label" htmlFor="end_date">End Date</label>
                            <DatePicker
                                className="custom-form-control"
                                selected={budget.end_date ? new Date(budget.end_date) : null}
                                onChange={(date) =>
                                    setBudget({...budget, end_date: date ? date.toISOString().split("T")[0] : ""})
                                }
                                dateFormat="yyyy-MM-dd"
                                placeholderText="End Date"
                            />
                            {errors.end_date && <p className="error-message mt-2">{errors.end_date[0]}</p>}
                        </div>

                        <button className="custom-btn btn-add">Save</button>
                    </form>
                )}
            </WizCard>
        </>
    );
}
