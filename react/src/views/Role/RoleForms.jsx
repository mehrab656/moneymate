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
    const [permission, setPermission] = useState([]);
    const handelCheck = (e) => {

        if (e.target.checked){
            permission.push(e.target.value)
        }else{
            permission.pop(e.target.value)
        }
        console.log(permission)
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
                        <div className="form-group">
                            <FormControl component="fieldset">
                                <FormLabel component="legend">
                                    <Checkbox color="primary"
                                              value={"company_all"}
                                              onChange={handelCheck}
                                    />
                                    Company
                                </FormLabel>
                                <FormGroup aria-label="position" row>
                                    <FormControlLabel
                                        value="company_create"
                                        control={<Checkbox color="primary"/>}
                                        label="Create"
                                        labelPlacement="end"
                                        onChange={handelCheck}
                                    />
                                    <FormControlLabel
                                        value="company_update"
                                        control={<Checkbox color="primary"/>}
                                        label="Update"
                                        labelPlacement="end"
                                        onChange={handelCheck}


                                    />
                                    <FormControlLabel
                                        value="company_view"
                                        control={<Checkbox color="primary"/>}
                                        label="View"
                                        labelPlacement="end"
                                        onChange={handelCheck}

                                    />
                                    <FormControlLabel
                                        value="company_delete"
                                        control={<Checkbox color="primary"/>}
                                        label="Delete"
                                        labelPlacement="end"
                                        onChange={handelCheck}

                                    />

                                </FormGroup>
                            </FormControl>
                            {errors && errors.name && (
                                <div className="text-danger">{errors.name[0]}</div>
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
