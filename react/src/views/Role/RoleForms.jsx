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

export default function RoleForms() {
    const navigate = useNavigate();
    let {id} = useParams();
    const [role, setRole] = useState({
        id: null,
        name: "",
        email: "",
        password: "",
        password_confirmation: ""
    });
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const {setNotification} = useStateContext();
    const [isAllCompanyChecked, setAllCompanyChecked] = useState(false);
    const [isAllSectorChecked, setAllSectorChecked] = useState(false);
    const [isAllCategoryChecked, setAllCategoryChecked] = useState(false);
    const [isAllInvestmentCompanyChecked, setAllInvestmentCompanyChecked] = useState(false);
    const [isAllExpenseChecked, setAllExpenseChecked] = useState(false);
    const [isAllIncomeChecked, setAllIncomeChecked] = useState(false);
    const [isAllReturnChecked, setAllReturnChecked] = useState(false);
    const [isAllIncomeReportChecked, setAllIncomeReportChecked] = useState(false);
    const [isAllExpenseReportChecked, setAllExpenseReportChecked] = useState(false);
    const [isAllInvestmentReportChecked, setAllInvestmentReportChecked] = useState(false);
    const [isAllMonthlyReportCompanyChecked, setAllMonthlyReportCompanyChecked] = useState(false);
    const [isAllOverAllReportChecked, setAllOverAllReportChecked] = useState(false);
    const [isAllBankChecked, setAllBankChecked] = useState(false);
    const [isAllAccountChecked, setAllAccountChecked] = useState(false);
    const [isAllBalanceTransferChecked, setAllBalanceTransferChecked] = useState(false);
    const [isAllDebtLoansChecked, setAllDebtLoansChecked] = useState(false);
    const [isAllBudgetsChecked, setAllBudgetsChecked] = useState(false);
    const [isAllInvestmentPlanChecked, setAllInvestmentPlanChecked] = useState(false);
    const [isAllCalendarChecked, setAllCalendarChecked] = useState(false);
    const [isAllActivityLogsChecked, setAllActivityLogsChecked] = useState(false);
    const [isAllApplicationChecked, setAllApplicationChecked] = useState(false);
    const [isAllUsersChecked, setAllUsersChecked] = useState(false);
    const [isAllProfileChecked, setAllProfileChecked] = useState(false);
    const [isAllRolesChecked, setAllRolesChecked] = useState(false);
    const [isAllDashboardViewChecked, setAllDashboardViewChecked] = useState(false);


    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        default_currency,
        registration_type,
    } = applicationSettings;

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
        if (role.id) {
            axiosClient
                .put(`/role/update/${role.id}`, role)
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
                .post("/role/add", role)
                .then(() => {
                    setNotification("Role was successfully created");
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
    const permissions = [];


    const handelCheck = (e, permission) => {
        const {checked} = e.target;

        if (e.target.checked) {
            permissions.push(e.target.value)

        } else {
            permissions.pop(e.target.value)
        }

        console.log(permissions)
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
                                value={role.name}
                                onChange={(ev) =>
                                    setRole({...role, name: ev.target.value})
                                }
                                placeholder="Name"
                            />
                            {errors && errors.name && (
                                <div className="text-danger">{errors.name[0]}</div>
                            )}
                        </div>
                        <RoleLists key={Math.random().toString(36).substring(2)} handelCheck={handelCheck}/>


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
