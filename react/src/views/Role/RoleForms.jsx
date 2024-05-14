import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../../axios-client.js";
import {useStateContext} from "../../contexts/ContextProvider.jsx";
import WizCard from "../../components/WizCard";
import {SettingsContext} from "../../contexts/SettingsContext";
import Badge from "react-bootstrap/Badge";
import MainLoader from "../../components/MainLoader.jsx";
import FormControlLabel from "@mui/material/FormControlLabel";
import {Box, FormControl, FormGroup} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormLabel from "@mui/material/FormLabel";
import RoleLists from "./RoleLists.jsx";
import {notification} from "../../components/ToastNotification.jsx";

export default function RoleForms() {
    const navigate = useNavigate();
    let {id} = useParams();
    const [role, setRole] = useState({
        role: '',
        status: 1
    });
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const {setNotification} = useStateContext();
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        default_currency,
        registration_type,
    } = applicationSettings;

    // State to hold the checked status
    const [permissions, setPermissions] = useState({
        company: {
            company_create: false,
            company_view: false,
            company_edit: false,
            company_delete: false,
        },
        sector: {
            sector_create: false,
            sector_view: false,
            sector_edit: false,
            sector_delete: false,
        },
        category: {
            category_create: false,
            category_view: false,
            category_edit: false,
            category_delete: false,
        },
        investment: {
            investment_create: false,
            investment_view: false,
            investment_edit: false,
            investment_delete: false,
        },
        expense: {
            expense_create: false,
            expense_view: false,
            expense_edit: false,
            expense_delete: false,
        },
        income: {
            income_create: false,
            income_view: false,
            income_edit: false,
            income_delete: false,
        },
        return: {
            return_create: false,
            return_view: false,
            return_edit: false,
            return_delete: false,
        },
        income_report: {
            income_report_create: false,
            income_report_view: false,
            income_report_edit: false,
            income_report_delete: false,
        },
        expense_report: {
            expense_report_create: false,
            expense_report_view: false,
            expense_report_edit: false,
            expense_report_delete: false,
        },
        investment_report: {
            investment_report_create: false,
            investment_report_view: false,
            investment_report_edit: false,
            investment_report_delete: false,
        },
        monthly_report: {
            monthly_report_create: false,
            monthly_report_view: false,
            monthly_report_edit: false,
            monthly_report_delete: false,
        },
        overall_report: {
            overall_report_create: false,
            overall_report_view: false,
            overall_report_edit: false,
            overall_report_delete: false,
        },
        bank: {
            bank_create: false,
            bank_view: false,
            bank_edit: false,
            bank_delete: false,
        },
        account: {
            account_create: false,
            account_view: false,
            account_edit: false,
            account_delete: false,
        },
        balance: {
            balance_create: false,
            balance_view: false,
            balance_edit: false,
            balance_delete: false,
        },
        debt: {
            debt_create: false,
            debt_view: false,
            debt_edit: false,
            debt_delete: false,
        },
        loans: {
            loans_create: false,
            loans_view: false,
            loans_edit: false,
            loans_delete: false,
        },
        budget: {
            budget_create: false,
            budget_view: false,
            budget_edit: false,
            budget_delete: false,
        },
        investment_plan: {
            investment_plan_create: false,
            investment_plan_view: false,
            investment_plan_edit: false,
            investment_plan_delete: false,
        },
        calender: {
            calender_create: false,
            calender_view: false,
            calender_edit: false,
            calender_delete: false,
        },
        activity_log: {
            activity_log_create: false,
            activity_log_view: false,
            activity_log_edit: false,
            activity_log_delete: false,
        },
        settings: {
            settings_create: false,
            settings_view: false,
            settings_edit: false,
            settings_delete: false,
        },
        user: {
            user_create: false,
            user_view: false,
            user_edit: false,
            user_delete: false,
        },
        profile: {
            profile_create: false,
            profile_view: false,
            profile_edit: false,
            profile_delete: false,
        },
        role: {
            role_create: false,
            role_view: false,
            role_edit: false,
            role_delete: false,
        },
        dashboard: {
            dashboard_monthly_income: false,
            dashboard_monthly_expense: false,
            dashboard_account_balance: false,
            dashboard_lend_amount: false,
            dashboard_borrow_amount: false,
            dashboard_total_bank: false,
            dashboard_expense_chart: false,
            dashboard_exp_budget: false,
            dashboard_active_budget: false,
        },
        // Add other sections similarly
    });

    if (id) {
        useEffect(() => {
            document.title = 'New Role';
            setLoading(true);
            axiosClient
                .get(`/roles/${id}`)
                .then(({data}) => {
                    setLoading(false);
                    setRole(data);
                })
                .catch(() => {
                    setLoading(false);
                });
        }, []);
    }


    const onSubmit = (ev) => {
        ev.preventDefault();
        setLoading(true);

        const mergedRoleData = {
            ...role,
            ...permissions.company,
            ...permissions.sector,
            ...permissions.category,
            ...permissions.investment,
            ...permissions.expense,
            ...permissions.income,
            ...permissions.return,
            ...permissions.income_report,
            ...permissions.expense_report,
            ...permissions.investment_report,
            ...permissions.monthly_report,
            ...permissions.overall_report,
            ...permissions.bank,
            ...permissions.account,
            ...permissions.balance,
            ...permissions.debt,
            ...permissions.loans,
            ...permissions.budget,
            ...permissions.investment_plan,
            ...permissions.calender,
            ...permissions.activity_log,
            ...permissions.settings,
            ...permissions.user,
            ...permissions.profile,
            ...permissions.role,
            ...permissions.dashboard
        };

        if (role.id) {
            axiosClient
                .put(`/role/update/${role.id}`, mergedRoleData)
                .then(() => {
                    setNotification("Role was successfully updated");
                    if (userRole === 'admin') {
                        navigate("/roles");
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                    setLoading(false);
                });
        } else {
            axiosClient
                .post("/role/add", mergedRoleData)
                .then(({data}) => {
                    notification(data?.status, data?.message, data?.description)
                    navigate("/roles");
                    setLoading(false);
                })
                .catch((err) => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                    setLoading(false);
                });
        }
    };


    return (
        <>
            <MainLoader loaderVisible={loading}/>
            {role.id && <h1 className="title-text">Update role: {role.name}</h1>}
            {!role.id && <h1 className="title-text">New role</h1>}
            <WizCard className="animated fadeInDown wiz-card-mh">
                {loading && <div className="text-center">Loading...</div>}
                {!loading && (
                    <form onSubmit={onSubmit} className="custom-form">
                        <div className="form-group">
                            <label htmlFor="role_nmae" className="custom-form-label">
                                Role Name
                            </label>
                            <input
                                className="custom-form-control"
                                value={role.role}
                                onChange={(ev) =>
                                    setRole({...role, role: ev.target.value})
                                }
                                placeholder="Name"
                            />

                        </div>
                        <RoleLists key={Math.random().toString(36).substring(2)} permissions={permissions}
                                   setPermissions={setPermissions}/>


                        <div className="text-end mt-4">
                            <button className="custom-btn btn-brand-primary btn-edit px-5">
                                Save
                            </button>
                        </div>
                    </form>
                )}


                {registration_type === 'subscription' && (

                    <div className="table-responsive-sm mt-4">
                        <div className="text-danger mb-2">
                            <div className="alert alert-info" role="alert">Subscription History
                            </div>
                        </div>
                        <table className="table table-bordered custom-table">
                            <thead>
                            <tr className={'text-center'}>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Amount</th>
                            </tr>
                            </thead>
                            {loading && (
                                <tbody>
                                <tr>
                                    <td colSpan={4} className="text-center">
                                        Loading...
                                    </td>
                                </tr>
                                </tbody>
                            )}
                            {!loading && (
                                <tbody>
                                {subscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            No Subscription found
                                        </td>
                                    </tr>
                                ) : (
                                    subscriptions.map((subscription) => (
                                        <tr className={'text-center'} key={subscription.id}>
                                            <td>{subscription.current_period_start}</td>
                                            <td>{subscription.current_period_end}</td>
                                            <td>

                                                <Badge
                                                    className={subscription.status === "active" ? "badge-active" : "badge-inactive"}>
                                                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td> {default_currency + subscription.amount}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            )}
                        </table>
                    </div>
                )}


            </WizCard>
        </>
    );
}
