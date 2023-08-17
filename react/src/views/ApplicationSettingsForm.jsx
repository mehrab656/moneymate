import React, {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";

export default function ApplicationSettingsForm() {
    const [applicationSettings, setApplicationSettings] = useState({
        company_name: "",
        web_site: "",
        default_currency: "",
        phone: "",
        address: "",
        num_data_per_page: "",
        public_key: "",
        secret_key: "",
        registration_type: "",
        subscription_price: null,
        product_api_id: ""
    });
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [userRole, setUserRole] = useState([]);
    const [registrationType, setRegistrationType] = useState("");

    const handleChange = (e) => {
        const {name, value} = e.target;
        setApplicationSettings((prevApplicationSettings) => ({
            ...prevApplicationSettings,
            [name]: value || ""
        }));
    };

    const {setNotification} = useStateContext();
    const {setApplicationSettings: setSettingsContext} = useContext(SettingsContext);

    useEffect(() => {
        document.title = "Application Setting";
        getUserRole();
        axiosClient
            .get("/get-application-settings")
            .then(({data}) => {
                const updatedSettings = {...applicationSettings};
                Object.keys(data.application_settings).forEach((key) => {
                    updatedSettings[key] = data.application_settings[key];
                });
                setApplicationSettings(updatedSettings);
                setRegistrationType(updatedSettings.registration_type);
                setSettingsContext(updatedSettings); // Update settings in the context
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const getUserRole = () => {
        axiosClient
            .get("/get-user-role")
            .then(({data}) => {
                setUserRole(data.role);
            })
            .catch((error) => {
                // console.log(error);
            });
    };

    if (userRole === "user") {
        navigate("/dashboard");
    }

    const applicationSettingsSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);


        axiosClient
            .put("/store-application-setting", applicationSettings)
            .then(() => {
                setNotification("Application settings have been updated");
                navigate("/application-settings");
                setSettingsContext(applicationSettings); // Update settings in the context
            })
            .catch((error) => {
                const response = error.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                }
            })
            .finally(() => {
                setSaving(false);
            });
    };

    return (
        <>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Application settings</h1>
            </div>
            <WizCard className="animated fadeInDown">
                {saving && (
                    <div className="loading-container">
                        <div>Loading...</div>
                    </div>
                )}
                {errors && (
                    <div className="alert">
                        {Object.keys(errors).map((key) => (
                            <p key={key}>{errors[key][0]}</p>
                        ))}
                    </div>
                )}
                {!loading && (
                    <form className="custom-form" onSubmit={applicationSettingsSubmit}>
                        <div className="row">
                            <div className="col-6">
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="company_name">
                                        Company Name
                                    </label>
                                    <input
                                        className="custom-form-control"
                                        name="company_name"
                                        value={applicationSettings.company_name || ""}
                                        onChange={handleChange}
                                        placeholder="Company Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="web_site">
                                        Web Site
                                    </label>
                                    <input
                                        className="custom-form-control"
                                        name="web_site"
                                        value={applicationSettings.web_site || ""}
                                        onChange={handleChange}
                                        placeholder="Web Site"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="default_currency">
                                        Default Currency
                                    </label>
                                    <input
                                        className="custom-form-control"
                                        name="default_currency"
                                        value={applicationSettings.default_currency || ""}
                                        onChange={handleChange}
                                        placeholder="Default Currency"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="address">
                                        Registration Type
                                    </label>
                                    <select
                                        className="form-control"
                                        name="registration_type"
                                        value={applicationSettings.registration_type}
                                        onChange={handleChange}
                                    >
                                        <option value="free">Free</option>
                                        <option value="subscription">Monthly Subscription</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="phone">
                                        Company Phone
                                    </label>
                                    <input
                                        className="custom-form-control"
                                        name="phone"
                                        value={applicationSettings.phone || ""}
                                        onChange={handleChange}
                                        placeholder="Phone"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="address">
                                        Company Address
                                    </label>
                                    <input
                                        className="custom-form-control"
                                        name="address"
                                        value={applicationSettings.address || ""}
                                        onChange={handleChange}
                                        placeholder="Address"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="address">
                                        Number of data per page
                                    </label>
                                    <input
                                        type="number"
                                        className="custom-form-control"
                                        name="num_data_per_page"
                                        value={applicationSettings.num_data_per_page || ""}
                                        onChange={handleChange}
                                        placeholder="Number of data per page"
                                    />
                                </div>
                            </div>
                            {applicationSettings.registration_type === "subscription" && (
                                <div className="col-12">
                                    <div className="alert alert-info">Payment Settings</div>
                                    <label className="custom-form-label" htmlFor="secret_key">
                                        Stripe Public Key
                                    </label>
                                    <input
                                        className="custom-form-control" name="public_key"
                                        value={applicationSettings.public_key || ""}
                                        onChange={handleChange}
                                        placeholder="Public Key"
                                    />

                                    <label className="custom-form-label mt-2" htmlFor="public_key">
                                        Stripe Secret Key
                                    </label>
                                    <input
                                        className="custom-form-control"
                                        name="secret_key"
                                        value={applicationSettings.secret_key || ""}
                                        onChange={handleChange}
                                        placeholder="Secret Key"
                                    />
                                    <label className="custom-form-label mt-2" htmlFor="product_api_id">
                                        Stripe Product Api ID
                                    </label>
                                    <input
                                        className="custom-form-control"
                                        name="product_api_id"
                                        value={applicationSettings.product_api_id || ""}
                                        onChange={handleChange}
                                        placeholder="Product Api ID"
                                    />
                                </div>
                            )}
                        </div>
                        <br/>
                        <button className="custom-btn btn-add">Save Settings</button>
                    </form>
                )}
            </WizCard>
        </>
    );
}

