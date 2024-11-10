import React, {useContext} from 'react';
import {SettingsContext} from '../../contexts/SettingsContext.jsx';
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {version} from '../../api/version.js'
const Footer = () => {
    const {applicationSettings} = useContext(SettingsContext);

    const {address, company_name, default_currency, phone, web_site} = applicationSettings;

    return (
        <footer style={{backgroundColor: "#f2f2f2", height: "50px"}}>
            <Row>
                <Col md={4} sm={6}>{company_name}</Col>
                <Col md={2} sm={6}><a target="_blank" href={`${web_site}`}>{"Website"}</a></Col>
                <Col md={4} sm={6}>{address}</Col>
                <Col md={2} sm={6}>Version: {version}</Col>
            </Row>

        </footer>
    );
};

export default Footer;
