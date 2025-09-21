import {Tab, Form, Card, Row, Col,Button} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {useUpdateBasicInfoMutation} from "../../../../api/slices/userSlice.js";
import {notification} from "../../../../components/ToastNotification.jsx";

const _initials={
    id: null,
    phone: "",
    emergency_contract: "",
    avatar: "",
    email: "",
}
export default function ContactInfo({user}){
    const [data, setData] = useState(_initials);
    const [btnText, setBtnText] = useState('Update')

    useEffect(() => {
        if (user){
            data.phone = user.phone;
            data.avatar = user.avatar;
            data.emergency_contract = user.emergency_contract;
            data.email = user.email;
        }
    }, [user]);
    const [updateBasicData] = useUpdateBasicInfoMutation();

    const updateBasicInfo = async (event) => {
        event.preventDefault();
        setBtnText("Updating...");
        // event.currentTarget.disabled = true;

        const formData = new FormData();
        formData.append("first_name", data.first_name);
        formData.append("last_name", data.last_name);
        formData.append("dob", data.dob);
        formData.append("gender", data.gender);
        try {
            const data = await updateBasicData({ url: `/update-basic-info/${user.slug}`, formData }).unwrap();
            notification("success", data?.message, data?.description);
            setBtnText("Update");

        } catch (err) {
            setBtnText("Try again");
            notification(
                "error",
                err?.message || "An error occurred",
                err?.description || "Please try again later."
            );
        }
    };

    const [image, setImage] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };

    return(
        <>
            <Tab.Pane eventKey="contacts">
                <Card>
                    <Card.Title className={"mb-5"}>Contacts Info</Card.Title>
                    <Form>
                        <Row>
                            <Col xs={8} sm={8}>
                                <Form.Group className="mb-3" controlId="phone">
                                    <Form.Label style={{ marginBottom: "0px" }} className="custom-form-label">
                                        Phone
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="i.g: +971212312..."
                                        value={data.phone}
                                        onChange={(e) => {
                                            setData({ ...data, phone: e.target.value });
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="emergency_contract">
                                    <Form.Label style={{ marginBottom: "0px" }} className="custom-form-label">
                                        Emergency Contact
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="i.g: +88123123...."
                                        value={data.emergency_contract}
                                        onChange={(e) => {
                                            setData({ ...data, emergency_contract: e.target.value });
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ marginBottom: "0px" }} className="custom-form-label">
                                        Email
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="i.g: john.dow@exm.co...."
                                        value={data.email}
                                        onChange={(e) => {
                                            setData({ ...data, email: e.target.value });
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={4} sm={4}>
                                <div className={"user-profile-section"}>
                                    {image && (
                                        <div style={{marginTop: "20px"}}>
                                            <img
                                                src={image}
                                                alt="Uploaded"
                                                style={{
                                                    width: "200px",
                                                    height: "200px",
                                                    borderRadius: "10px",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange}/>

                                </div>
                            </Col>
                        </Row>
                        <Button
                            onClick={(e) => updateBasicInfo(e)}
                            className="custom-btn">{btnText}
                        </Button>
                    </Form>
                </Card>
            </Tab.Pane>
        </>
    )
}