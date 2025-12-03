import React, {useContext} from 'react';
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {version} from '../../api/version.js'
import { SettingsContext } from '../../contexts/SettingsContext.jsx';
import { useTheme } from '@mui/material/styles';
const Footer = () => {
    const {applicationSettings} = useContext(SettingsContext);
    const theme = useTheme();

    const {address, company_name, default_currency, phone, web_site} = applicationSettings;

    return (
        <footer style={{backgroundColor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}`, height: 'auto'}}>
            <Row className='d-flex justify-content-center align-items-center p-3'>
                <Col md={4} sm={6}>{company_name}</Col>
                <Col md={4} sm={6}>{address}</Col>
                <Col md={2} sm={6}>Version: {version}</Col>
            </Row>

        </footer>
    );
};

export default Footer;
