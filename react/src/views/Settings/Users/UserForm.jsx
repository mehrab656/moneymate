import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../../../axios-client.js";
import {useStateContext} from "../../../contexts/ContextProvider.jsx";
import WizCard from "../../../components/WizCard.jsx";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import Badge from "react-bootstrap/Badge";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import {Col, Nav, Form, Card, Row,Button,Tab} from "react-bootstrap";
import BasicInfo from "./ProfileTabs/BasicInfo.jsx";
import ContactInfo from "./ProfileTabs/ContactInfo.jsx";
import EmploymentInfo from "./ProfileTabs/EmploymentInfo.jsx";
import SecurityInfo from "./ProfileTabs/SecurityInfo.jsx";
import TwoFactAuthentication from "./ProfileTabs/TwoFactAuthentication.jsx";
import {Avatar} from "@mui/material";

const navItems = [
    {eventKey:'basic', tabName:'Basic'},
    {eventKey:'contacts', tabName:'Contacts'},
    {eventKey:'employment', tabName:'Employment Details'},
    {eventKey:'security', tabName:'Security'},
    {eventKey:'authentication', tabName:'2F Authentication'},
]
export default function UserForm() {
    const navigate = useNavigate();
    let {id} = useParams();
    const [user, setUser] = useState({
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
    const [activeTab, setActiveTab] = useState('basic')

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
                .get(`/get-single-user/${id}`)
                .then(({data}) => {
                    setLoading(false);
                    setUser(data);
                })
                .catch(() => {
                    setLoading(false);
                });
        }, []);
    }


    const onSubmit = (ev) => {
        ev.preventDefault();
        setLoading(true);
        if (user.id) {
            axiosClient
                .put(`/users/${user.id}`, user)
                .then(() => {
                    setNotification("User was successfully updated");
                    if (userRole === 'admin'){
                        navigate("/users");
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
                .post("/users", user)
                .then(() => {
                    setNotification("User was successfully created");
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

    const setCurrentTab = (eventKey)=>{
        setActiveTab(eventKey)
    }
    const renderTabContent = (tab)=>{
        if (tab==='basic'){
            return <BasicInfo user={user}/>;
        }
        else if(tab==='contacts'){
            return <ContactInfo user={user} />;
        }
        else if(tab==='employment'){
            return <EmploymentInfo />;
        }
        else if(tab==='security'){
            return <SecurityInfo />;
        }else{
            return <TwoFactAuthentication />;
        }
    }
    return (
        <>
          <MainLoader loaderVisible={loading} />
            {user.id && <h1 className="title-text">Update User: {user.username}</h1>}
            {!user.id && <h1 className="title-text">New User</h1>}
            <WizCard className="animated fadeInDown wiz-card-mh">
                {loading && <div className="text-center">Loading...</div>}
                <Row>
                    <Tab.Container id="left-tabs-example" defaultActiveKey={activeTab}>
                        <Row>
                            <Col sm={3}>
                                <Card>
                                    <div className={"user-avatar"}>
                                        <Avatar sx={{width: 100, height: 100}} alt={user?.username ?? "User"} src={user?.avatar}/>
                                        <span><h1>{user?.username}</h1></span>
                                    </div>
                                    <Nav variant="pills" className="flex-column">
                                        {
                                            navItems.map((item,index,tab)=>(
                                                <Nav.Item key={index}>
                                                    <Nav.Link  eventKey={item.eventKey} onClick={()=>setCurrentTab(item.eventKey)}>{item.tabName}</Nav.Link>
                                                </Nav.Item>
                                            ))
                                        }
                                    </Nav>
                                </Card>
                            </Col>

                            <Col sm={9}>
                                <Tab.Content>

                                    {
                                        renderTabContent(activeTab)
                                    }
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </Row>


            </WizCard>
        </>
    );
}
