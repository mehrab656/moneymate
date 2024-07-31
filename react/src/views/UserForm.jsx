import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import Badge from "react-bootstrap/Badge";
import MainLoader from "../components/MainLoader.jsx";
import {Box, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {notification} from "../components/ToastNotification.jsx";

export default function UserForm() {
    const navigate = useNavigate();
    let {id} = useParams();
    const [user, setUser] = useState({
        id: null,
        name: "",
        email: "",
        role_id: "",
        password: "",
        password_confirmation: ""
    });
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const {setNotification} = useStateContext();
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("")
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        default_currency,
        registration_type,
    } = applicationSettings;

    if (id) {
        useEffect(() => {
            document.title = 'View User';
            setLoading(true);
            axiosClient
                .get(`/users/${id}`)
                .then(({data}) => {
                    setLoading(false);
                    setUser(data);
                })
                .catch(() => {
                    setLoading(false);
                });
        }, []);
    }
    useEffect(() => {
        axiosClient
            .get("/company-role-list")
            .then(({data}) => {
                setRoles(data.data);
                console.log(roles)
            })
            .catch((error) => {
                console.warn("Error fetching Role Lists:", error);
            });
    }, []);

    const onSubmit = (ev) => {
        ev.preventDefault();
        setLoading(true);
        if (user.id) {
            axiosClient
                .put(`/users/${user.id}`, user)
                .then(() => {
                    notification('success', data?.message, data?.description)
                    navigate("/users");
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
                .post("/users", user)
                .then(({data}) => {
                    notification('success', data?.message, data?.description)
                    navigate("/users");
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
            {user.id && <h1 className="title-text">Update User: {user.name}</h1>}
            {!user.id && <h1 className="title-text">New User</h1>}
            <WizCard className="animated fadeInDown wiz-card-mh">
                {loading && <div className="text-center">Loading...</div>}
                {!loading && (
                    <form onSubmit={onSubmit} className="custom-form">
                        <div className="form-group">
                            <label htmlFor="user_name" className="custom-form-label">
                                User Name
                            </label>
                            <input
                                className="custom-form-control"
                                value={user.name}
                                onChange={(ev) =>
                                    setUser({...user, name: ev.target.value})
                                }
                                placeholder="Name"
                            />
                            {errors && errors.name && (
                                <div className="text-danger">{errors.name[0]}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="user_email" className="custom-form-label">
                                User Email
                            </label>
                            <input
                                className="custom-form-control"
                                value={user.email}
                                onChange={(ev) =>
                                    setUser({...user, email: ev.target.value})
                                }
                                placeholder="Email"
                            />
                            {errors && errors.email && (
                                <div className="text-danger">{errors.email[0]}</div>
                            )}
                        </div>

                        <div className='form-group'>
                            <Box sx={{minWidth: 120}}>
                                <FormControl fullWidth>
                                    <InputLabel id='role-label'>Role</InputLabel>
                                    <Select
                                        labelId='role-label'
                                        id='role_id'
                                        value={selectedRole}
                                        label='Role'
                                        name='role_id'
                                        onChange={(event) => {
                                            const value = event.target.value || "";
                                            setSelectedRole(value);
                                            setUser({...user, role_id: parseInt(value)});
                                        }}
                                    >
                                        {roles.length > 0 ?
                                            roles.map((role) => (
                                                <MenuItem key={role.id}
                                                          value={role.id}>{role.role}</MenuItem>
                                            )) :
                                            <MenuItem disabled key={"nothing"} value={"0"}>{"No roles Found"}</MenuItem>
                                        }
                                    </Select>
                                </FormControl>
                            </Box>
                            {/*{errors.role_id && (*/}
                            {/*    <p className='error-message mt-2'>{errors.role_id[0]}</p>*/}
                            {/*)}*/}
                        </div>
                        {
                            id &&
                            <div className="text-danger mb-2">
                                <div className="alert alert-warning" role="alert">Leave both password field blank, if
                                    you do
                                    not want to change your account password
                                </div>
                            </div>
                        }


                        <div className="form-group">
                            <label htmlFor="password" className="custom-form-label">
                                Password
                            </label>
                            <input
                                className="custom-form-control"
                                type="password"
                                onChange={(ev) =>
                                    setUser({...user, password: ev.target.value})
                                }
                                placeholder="Password"
                            />
                            {errors && errors.password && (
                                <div className="text-danger">{errors.password[0]}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm_password" className="custom-form-label">
                                Confirm Password
                            </label>
                            <input
                                className="custom-form-control"
                                type="password"
                                onChange={(ev) =>
                                    setUser({...user, password_confirmation: ev.target.value})
                                }
                                placeholder="Password Confirmation"
                            />
                            {errors && errors.password_confirmation && (
                                <div className="text-danger">{errors.password_confirmation[0]}</div>
                            )}
                        </div>

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
