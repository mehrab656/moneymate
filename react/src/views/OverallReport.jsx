import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import Table from 'react-bootstrap/Table'
import MainLoader from "../components/MainLoader.jsx";

export default function OverallReport() {

    const [getTotalInvestments, setTotalInvestments] = useState(0);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(false);
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const {
        default_currency,
    } = applicationSettings;

    const getInvestmentReports = () => {
        setLoading(true);
        try {
            axiosClient.get('/report/investment', {
                params: {start_date: startDate, end_date: endDate},
            }).then(({data}) => {
                setTotalInvestments(data.totalInvestment);
                setInvestments(data.investments);
                setLoading(false);
            })
        } catch (error) {
            console.warn(error);
            setLoading(false);
        }
    };


    useEffect(() => {
        document.title = "Investment Reports";
        getInvestmentReports();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        getInvestmentReports();
    };

    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <WizCard className="animated fadeInDown">
                <div className="row">
                    <div className="col-12">
                        <h1 className="title-text text-center">Total Investment Reports</h1>
                        <div className="responsive" style={{overflow: 'auto'}}>

                        </div>
                    </div>
                </div>
            </WizCard>
        </>
    )
}
