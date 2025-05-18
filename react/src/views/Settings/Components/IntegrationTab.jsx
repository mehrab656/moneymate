import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, {useEffect, useState} from "react";
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Image from 'react-bootstrap/Image';
import axiosClient from "../../../axios-client.js";
import {notification} from "../../../components/ToastNotification.jsx";
import {useConnectHostAwayMutation,useGetHostAwayStatusDataQuery} from "../../../api/slices/settingsSlice.js";

const defaultData = {
    host_away_client_id:'',
    host_away_api_key:''
}
export default function IntegrationTab({settings,handleFunc,submit}){
const [hostAwayCanvas,setHostAwayCanvas]=useState(false);
const [hostAwyConnectionStatus,setHostAwayConnectionStatus]=useState(false);
const [integrationData,setIntegrationData]=useState(defaultData);
const [hostAwayActionBtn,setHostAwayActionBtn] = useState({
    text:'Active',
    bg:'primary',
    disable:false
});
const [hostAwayConnectBtn,setHostAwayConnectBtn] = useState({
    text:'Connect',
    bg:'primary',
    disable:false
});

    const [hostAwayConnection] = useConnectHostAwayMutation();
    const {data:hostaway} = useGetHostAwayStatusDataQuery({});

    const getHostAwayConnection = async (e) =>{
    e.preventDefault();
    let formData = new FormData();
    formData.append("host_away_client_id", integrationData.host_away_client_id);
    formData.append("host_away_api_key", integrationData.host_away_api_key);

    try {
        const data = await hostAwayConnection({ formData }).unwrap();
        notification('success', data?.message, data?.description);
        setHostAwayConnectBtn({text: "Connected",disable: true,bg:'success'})
        setHostAwayActionBtn({text: "Disconnect",disable: false,bg:'danger'})
    }catch (err){
        notification(
            "error",
            err?.message || "An error occurred",
            err?.description || "Please try again later."
        );
    }
}
    useEffect(()=> {
    },[]);

    return (
        <>
            <Container >
                <Stack className="animated fadeInDown mb-3" direction="horizontal" gap={3}>
                    <div className="p-2">{hostAwyConnectionStatus?'Connected':'Not Connected'}</div>
                    <div className="p-2 ms-auto">Hostaway</div>
                    <div className="vr"/>
                    <Button ize={"sm"} variant={hostAwayActionBtn.bg} onClick={()=>{setHostAwayCanvas(!hostAwayCanvas)}}>{hostAwayActionBtn.text}</Button>
                </Stack>
                <Stack className="animated fadeInDown mb-3" direction="horizontal" gap={3}>
                    <div className="p-2">not connected</div>
                    <div className="p-2 ms-auto">Stripe</div>
                    <div className="vr"/>
                    <Button size={"sm"} variant="primary">Connect</Button>
                </Stack>
                <Stack className="animated fadeInDown mb-3" direction="horizontal" gap={3}>
                    <div className="p-2">not connected</div>
                    <div className="p-2 ms-auto">Airbnb</div>
                    <div className="vr"/>
                    <Button variant="primary">Connect</Button>
                </Stack>
                <Stack className="animated fadeInDown mb-3" direction="horizontal" gap={3}>
                    <div className="p-2">not connected</div>
                    <div className="p-2 ms-auto">Booking.com</div>
                    <div className="vr"/>
                    <Button variant="primary">Connect</Button>
                </Stack>

                <Offcanvas show={hostAwayCanvas}
                           onHide={()=>{setHostAwayCanvas(!hostAwayCanvas)}} backdrop="static"
                placement={"end"}>
                    <Offcanvas.Header closeButton>
                        <Image src="hostaway.png" rounded style={{height:"100px",width:"100px"}} />
                        <Offcanvas.Title>HostAway</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <span>Provide the api key and secret key to connect with HostAway.</span>

                        <Form>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3" controlId="company.hostawayClient">
                                        <Form.Label>{"Client ID"}</Form.Label>
                                        <Form.Control type="text"
                                                      placeholder="7123841..."
                                                      value={integrationData.host_away_client_id}
                                                      onChange={(ev) =>
                                                          setIntegrationData({...integrationData, host_away_client_id: ev.target.value})
                                                      }                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3" controlId="company.hostawayApi">
                                        <Form.Label>{"Hostaway Api Secret"}</Form.Label>
                                        <Form.Control type="text"
                                                      placeholder=""
                                                      value={integrationData.host_away_api_key}
                                                      onChange={(ev) =>
                                                          setIntegrationData({...integrationData, host_away_api_key: ev.target.value})
                                                      }
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button ize={"sm"} variant={hostAwayConnectBtn.bg} disabled={hostAwayConnectBtn.disable} onClick={(event)=>{getHostAwayConnection(event)}} >{hostAwayConnectBtn.text}</Button>
                                </Col>
                            </Row>
                        </Form>

                    </Offcanvas.Body>
                </Offcanvas>
            </Container>

        </>
    )
}