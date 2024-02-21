import React, {useContext} from 'react';
import {SettingsContext} from '../contexts/SettingsContext.jsx';

const Footer = () => {
    const {applicationSettings} = useContext(SettingsContext);

    const {address, company_name, default_currency, phone, web_site} = applicationSettings;

    return (
        <footer style={{backgroundColor: "#f2f2f2", height: "50px"}}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                }}>
                <p>{company_name} | <a target="_blank" href={`${web_site}`}>{web_site}</a> |
                    {phone} | {address} </p>
            </div>
        </footer>
    );
};

export default Footer;
