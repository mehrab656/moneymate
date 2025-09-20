import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../axios-client.js";
import { useStateContext } from "../../../contexts/ContextProvider.jsx";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import ProfileTab from "./Components/ProfileTab.jsx";
import CompanyTab from "./Components/CompanyTab.jsx";
import GeneralTab from "./Components/GeneralTab.jsx";
import IntegrationTab from "./Components/IntegrationTab.jsx";

const defaultApplicationSettings = {
  company_name: "",
  web_site: "",
  default_currency: "",
  phone: "",
  landline_number: "",
  address: "",
  num_data_per_page: "",
  public_key: "",
  secret_key: "",
  registration_type: "",
  subscription_price: null,
  product_api_id: "",
  associative_categories: [],
  host_away_api_key: "",
  host_away_client_id: "",
};

const tabSections = [
  { eventKey: "profile", title: "Profile" },
  { eventKey: "company", title: "Company" },
  { eventKey: "general", title: "General" },
  { eventKey: "integration", title: "Integrations" },
  { eventKey: "notification", title: "Notifications" },
];
export default function Settings() {
  const [applicationSettings, setApplicationSettings] = useState(
    defaultApplicationSettings
  );
  const [settings, setSettings] = useState(defaultApplicationSettings);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationSettings((prevApplicationSettings) => ({
      ...prevApplicationSettings,
      [name]: value || "",
    }));
  };

  const { setNotification } = useStateContext();
  const { setApplicationSettings: setSettingsContext } =
    useContext(SettingsContext);

  useEffect(() => {
    document.title = "Application Setting";
    axiosClient
      .get("/get-application-settings")
      .then(({ data }) => {
        var updatedSettings = { ...applicationSettings };
        Object.keys(data.application_settings).forEach((key) => {
          updatedSettings[key] = data.application_settings[key];
        });

        const categories = data.application_settings;
        const parseCat = JSON.parse(categories?.associative_categories);

        var storeStting = { ...updatedSettings };
        Object.keys(storeStting).forEach((key) => {
          storeStting["associative_categories"] = parseCat;
        });

        setApplicationSettings(storeStting);
        setSettingsContext(storeStting); // Update settings in the context
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const applicationSettingsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setLoading(true);
    axiosClient
      .put("/store-application-setting", applicationSettings)
      .then((data) => {
        // setNotification("Application settings have been updated");
        navigate("/application-settings");
        setSettingsContext(applicationSettings); // Update settings in the context

        notification("success", data?.message, data?.description);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response) {
          const error = err.response.data;
          notification("error", error?.message, error.description);
        }
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const [categories, setCategories] = useState([]);

  const getCategories = () => {
    setLoading(true);
    axiosClient
      .get("/categories")
      .then(({ data }) => {
        setLoading(false);
        setCategories(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getCategories();
  }, []);

  const sectionBody = (eventKey) => {
    if (eventKey === "profile") {
      return (
        <>
          {" "}
          <ProfileTab
            settings={settings}
            handleFunc={handleChange}
            submit={applicationSettingsSubmit}
          />{" "}
        </>
      );
    }
    if (eventKey === "company") {
      return (
        <>
          <CompanyTab
            settings={settings}
            handleFunc={handleChange}
            submit={applicationSettingsSubmit}
          />
        </>
      );
    }
    if (eventKey === "general") {
      return (
        <>
          <GeneralTab
            settings={settings}
            handleFunc={handleChange}
            submit={applicationSettingsSubmit}
          />
        </>
      );
    }
    if (eventKey === "integration") {
      return (
        <>
          <IntegrationTab
            settings={settings}
            handleFunc={handleChange}
            submit={applicationSettingsSubmit}
          />
        </>
      );
    }
    if (eventKey === "notification") {
      return (
        <>
          {" "}
          <ProfileTab
            settings={settings}
            handleFunc={handleChange}
            submit={applicationSettingsSubmit}
          />
        </>
      );
    }
  };

  return (
    <>
      <MainLoader loaderVisible={loading} />
      <Tabs defaultActiveKey="profile" id="settings-tab" className="mb-3" fill>
        {tabSections.map((section, key) => (
          <Tab eventKey={section.eventKey} title={section.title} key={`${key}`}>
            {sectionBody(section.eventKey)}
          </Tab>
        ))}
      </Tabs>
      {/*<WizCard className="animated fadeInDown">*/}
      {/*    {saving && (*/}
      {/*        <div className="loading-container">*/}
      {/*            <div>Loading...</div>*/}
      {/*        </div>*/}
      {/*    )}*/}
      {/*    {errors && (*/}
      {/*        <div className="alert">*/}
      {/*            {Object.keys(errors).map((key) => (*/}
      {/*                <p key={key}>{errors[key][0]}</p>*/}
      {/*            ))}*/}
      {/*        </div>*/}
      {/*    )}*/}
      {/*    {!loading && (*/}
      {/*        <form className="custom-form" onSubmit={applicationSettingsSubmit}>*/}
      {/*            <div className="row">*/}
      {/*                <div className="col-6">*/}

      {/*                    <div className="form-group">*/}
      {/*                        <label className="custom-form-label" htmlFor="address">*/}
      {/*                            Registration Type*/}
      {/*                        </label>*/}
      {/*                        <select*/}
      {/*                            className="form-control"*/}
      {/*                            name="registration_type"*/}
      {/*                            value={applicationSettings.registration_type}*/}
      {/*                            onChange={handleChange}*/}
      {/*                        >*/}
      {/*                            <option value="free">Free</option>*/}
      {/*                            <option value="subscription">Monthly Subscription</option>*/}
      {/*                        </select>*/}
      {/*                    </div>*/}
      {/*                </div>*/}
      {/*                <div className="col-6">*/}

      {/*                </div>*/}
      {/*                {applicationSettings.registration_type === "subscription" && (*/}
      {/*                    <div className="col-12">*/}
      {/*                        <div className="alert alert-info">Payment Settings</div>*/}
      {/*                        <label className="custom-form-label" htmlFor="secret_key">*/}
      {/*                            Stripe Public Key*/}
      {/*                        </label>*/}
      {/*                        <input*/}
      {/*                            className="custom-form-control" name="public_key"*/}
      {/*                            value={applicationSettings.public_key || ""}*/}
      {/*                            onChange={handleChange}*/}
      {/*                            placeholder="Public Key"*/}
      {/*                        />*/}

      {/*                        <label className="custom-form-label mt-2" htmlFor="public_key">*/}
      {/*                            Stripe Secret Key*/}
      {/*                        </label>*/}
      {/*                        <input*/}
      {/*                            className="custom-form-control"*/}
      {/*                            name="secret_key"*/}
      {/*                            value={applicationSettings.secret_key || ""}*/}
      {/*                            onChange={handleChange}*/}
      {/*                            placeholder="Secret Key"*/}
      {/*                        />*/}
      {/*                        <label className="custom-form-label mt-2" htmlFor="product_api_id">*/}
      {/*                            Stripe Product Api ID*/}
      {/*                        </label>*/}
      {/*                        <input*/}
      {/*                            className="custom-form-control"*/}
      {/*                            name="product_api_id"*/}
      {/*                            value={applicationSettings.product_api_id || ""}*/}
      {/*                            onChange={handleChange}*/}
      {/*                            placeholder="Product Api ID"*/}
      {/*                        />*/}
      {/*                        /!* <label className="custom-form-label mt-2" htmlFor="product_api_id">*/}
      {/*                            Associative Categories*/}
      {/*                        </label>*/}
      {/*                        <input*/}
      {/*                            className="custom-form-control"*/}
      {/*                            name="associative_categories"*/}
      {/*                            value={applicationSettings.associative_categories || ""}*/}
      {/*                            onChange={handleChange}*/}
      {/*                            placeholder="Associative Categories"*/}
      {/*                        /> *!/*/}

      {/*                        <Box sx={{mt: 4}}>*/}
      {/*                            <Autocomplete*/}
      {/*                                name="associative_categories"*/}
      {/*                                multiple*/}
      {/*                                options={[]}*/}
      {/*                                onChange={(event, newValue) => {*/}
      {/*                                    setApplicationSettings({*/}
      {/*                                        ...applicationSettings,*/}
      {/*                                        ['associative_categories']: newValue || ""*/}
      {/*                                    })*/}

      {/*                                }}*/}
      {/*                                freeSolo*/}
      {/*                                renderTags={(value, getTagProps) =>*/}
      {/*                                    value.map((option, index) => (*/}
      {/*                                        <Chip variant="outlined" name="associative_categories"*/}
      {/*                                              label={option} {...getTagProps({index})} />*/}
      {/*                                    ))*/}
      {/*                                }*/}
      {/*                                renderInput={(params) => (*/}
      {/*                                    <TextField*/}
      {/*                                        name="associative_categories"*/}
      {/*                                        {...params}*/}
      {/*                                        variant="filled"*/}
      {/*                                        label="Associative Categories"*/}
      {/*                                        placeholder="Associative Categories"*/}
      {/*                                    />*/}
      {/*                                )}*/}
      {/*                            />*/}
      {/*                        </Box>*/}

      {/*                    </div>*/}
      {/*                )}*/}

      {/*                <p><b>Third Party Connection</b></p>*/}
      {/*                <div className="form-group">*/}
      {/*                    <label className="custom-form-label" htmlFor="host_away_client_id">*/}
      {/*                        Hostaway Client ID*/}
      {/*                    </label>*/}
      {/*                    <input*/}
      {/*                        type="number"*/}
      {/*                        className="custom-form-control"*/}
      {/*                        name="host_away_client_id"*/}
      {/*                        value={applicationSettings.host_away_client_id || ""}*/}
      {/*                        onChange={handleChange}*/}
      {/*                        placeholder="Hostaway client id"*/}
      {/*                    />*/}
      {/*                </div>*/}
      {/*                <div className="form-group">*/}
      {/*                    <label className="custom-form-label" htmlFor="host_away_api_key">*/}
      {/*                        Hostaway Api Secret*/}
      {/*                    </label>*/}
      {/*                    <input*/}
      {/*                        type="text"*/}
      {/*                        className="custom-form-control"*/}
      {/*                        name="host_away_api_key"*/}
      {/*                        value={applicationSettings.host_away_api_key || ""}*/}
      {/*                        onChange={handleChange}*/}
      {/*                        placeholder="Hostaway Api Secret"*/}
      {/*                    />*/}
      {/*                </div>*/}
      {/*            </div>*/}
      {/*            <br/>*/}
      {/*            <button className="custom-btn btn-add">Save Settings</button>*/}
      {/*        </form>*/}
      {/*    )}*/}
      {/*</WizCard>*/}
    </>
  );
}
