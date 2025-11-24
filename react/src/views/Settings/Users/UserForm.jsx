import {useNavigate, useParams, useLocation} from "react-router-dom";
import React, {useContext, useEffect, useState, useRef} from "react";
// Use RTK Query hooks for consistency
import { useGetMyProfileQuery, useGetSingleUserDataQuery } from "../../../api/slices/userSlice.js";
import {useStateContext} from "../../../contexts/ContextProvider.jsx";
import WizCard from "../../../components/WizCard.jsx";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import {Col, Nav, Card, Row,Tab} from "react-bootstrap";
import BasicInfo from "./ProfileTabs/BasicInfo.jsx";
import EmploymentInfo from "./ProfileTabs/EmploymentInfo.jsx";
import SecurityInfo from "./ProfileTabs/SecurityInfo.jsx";
import TwoFactAuthentication from "./ProfileTabs/TwoFactAuthentication.jsx";
import {Avatar} from "@mui/material";
// No RTK query for my-profile yet; use axiosClient directly

const navItems = [
    {eventKey:'basic', tabName:'Basic'},
    {eventKey:'employment', tabName:'Employment Details'},
    {eventKey:'security', tabName:'Security'},
    {eventKey:'authentication', tabName:'2F Authentication'},
]
export default function UserForm() {
    const navigate = useNavigate();
    const location = useLocation();
    let {id} = useParams();
    const [user, setUser] = useState({
        id: null,
        name: "",
        email: "",
        password: "",
        password_confirmation: ""
    });
    // Queries: by id (admin) or current user (my-profile)
    const { data: userById, isFetching: fetchingById } = useGetSingleUserDataQuery({ id }, { skip: !id });
    const { data: myProfile, isFetching: fetchingMyProfile } = useGetMyProfileQuery(undefined, {
        skip: !!id,
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
    });
    const loading = fetchingById || fetchingMyProfile;
    const [activeTab, setActiveTab] = useState('basic')

    // Map between query param values and internal eventKeys
    const tabParamToEventKey = {
        basic: 'basic',
        'employment-details': 'employment',
        employment: 'employment',
        security: 'security',
        authentication: 'authentication',
    };
    const eventKeyToTabParam = {
        employment: 'employment-details',
        basic: 'basic',
        security: 'security',
        authentication: 'authentication',
    };

    // Set page title and sync local state for downstream props
    useEffect(() => {
        if (id) {
            document.title = 'View User';
            if (userById) setUser(userById);
        } else {
            document.title = 'My Profile';
            if (myProfile) setUser((prev) => {
                // Guard against redundant state updates
                if (!prev) return myProfile;
                const same = prev?.username === myProfile?.username && prev?.avatar === myProfile?.avatar;
                return same ? prev : myProfile;
            });
        }
    }, [id, userById, myProfile]);

    // Sync active tab from ?tab= query param
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam) {
            const nextKey = tabParamToEventKey[tabParam] || 'basic';
            setActiveTab(nextKey);
        } else {
            setActiveTab('basic');
        }
    }, [location.search]);


    const setCurrentTab = (eventKey)=>{
        setActiveTab(eventKey);
        const tabParam = eventKeyToTabParam[eventKey] || eventKey;
        // Update only the query string, preserve current path
        navigate({ pathname: location.pathname, search: `?tab=${tabParam}` }, { replace: true });
    }
    const renderTabContent = (tab)=>{
        if (tab==='basic'){
            return <BasicInfo user={user} />;
        }
        else if(tab==='employment'){
            return <EmploymentInfo user={user} />;
        }
        else if(tab==='security'){
            return <SecurityInfo user={user} />;
        }else{
            return <TwoFactAuthentication />;
        }
    }
    return (
        <>
          <MainLoader loaderVisible={loading} />
            <WizCard className="animated fadeInDown wiz-card-mh">
                {loading && <div className="text-center">Loading...</div>}
                <Row>
                    <Tab.Container id="left-tabs-example" activeKey={activeTab}>
                        <Row>
                            <Col sm={3}>
                                <Card>
                                    <div className={"user-avatar"}>
                                        <Avatar sx={{width: 100, height: 100}} alt={user?.username ?? "User"} src={user?.avatar}/>
                                        <span><h3>{user?.username}</h3></span>
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
