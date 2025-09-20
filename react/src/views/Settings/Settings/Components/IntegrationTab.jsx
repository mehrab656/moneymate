import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, {useEffect, useState} from "react";
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Image from 'react-bootstrap/Image';
import {notification} from "../../../../components/ToastNotification.jsx";
import {useGetConnectPmsDataMutation,useGetPmsStatusDataQuery} from "../../../../api/slices/settingsSlice.js";
import Select from 'react-select'

const defaultData = {
    pmsName:'',
    pmsClientID:'',
    pmsApiKey:''
}
const pmsNames = [
    { value: 'hostaway', label: 'HostAway' },
    { value: 'lodgify', label: 'Lodgify' },
    { value: 'guesty', label: 'Guesty' }
]
export default function IntegrationTab({settings,handleFunc,submit}){
const [pmsCanvas,setPmsCanvas]=useState(false);
const [hostAwyConnectionStatus,setPmsConnectionStatus]=useState(false);
const [integrationData,setIntegrationData]=useState(defaultData);
const [pmsActionBtn,setPmsActionBtn] = useState({
    text:'Active',
    bg:'primary',
    disable:false
});
const [pmsConnectBtn,setPmsConnectBtn] = useState({
    text:'Connect',
    bg:'primary',
    disable:false
});
const [pmsData,setPmsData] = useState(defaultData);

    const [pmsConnection] = useGetConnectPmsDataMutation();
    const {data:hostaway} = useGetPmsStatusDataQuery({});

    const getPmsConnection = async (e) =>{
    e.preventDefault();
    let formData = new FormData();
    formData.append("host_away_client_id", integrationData.host_away_client_id);
    formData.append("host_away_api_key", integrationData.host_away_api_key);

    try {
        const data = await pmsConnection({ formData }).unwrap();
        notification('success', data?.message, data?.description);
        setPmsConnectBtn({text: "Connected",disable: true,bg:'success'})
        setPmsActionBtn({text: "Disconnect",disable: false,bg:'danger'})
    }catch (err){
        notification(
            "error",
            err?.message || "An error occurred",
            err?.description || "Please try again later."
        );
    }
}

const changePMSName = pmsName => {
        set
}

    return (
        <>
            <Container >
                <Stack className="animated fadeInDown mb-3" direction="horizontal" gap={3}>
                    <div className="p-2">{hostAwyConnectionStatus?'Connected':'Not Connected'}</div>
                    <div className="p-2 ms-auto">Property Management System</div>
                    <div className="vr"/>
                    <Button ize={"sm"} variant={pmsActionBtn.bg} onClick={()=>{setPmsCanvas(!pmsCanvas)}}>{pmsActionBtn.text}</Button>
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

                <Offcanvas show={pmsCanvas}
                           onHide={()=>{setPmsCanvas(!pmsCanvas)}} backdrop="static"
                placement={"end"}>
                    <Offcanvas.Header closeButton>
                        <Image src="hostaway.png" rounded style={{height:"100px",width:"100px"}} />
                        <Offcanvas.Title>Pms</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <span>Provide the api key and secret key to connect with Pms.</span>

                        <Form>
                            <Row>
                                <Col>
                                    <Select placeholder={'Name of PMS'} options={pmsNames} onChange={(e)=>changePMSName(e.value)} />
                                </Col>
                            </Row>

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
                                    <Button ize={"sm"} variant={pmsConnectBtn.bg} disabled={pmsConnectBtn.disable} onClick={(event)=>{getPmsConnection(event)}} >{pmsConnectBtn.text}</Button>
                                </Col>
                            </Row>
                        </Form>

                    </Offcanvas.Body>
                </Offcanvas>
            </Container>

        </>
    )
}