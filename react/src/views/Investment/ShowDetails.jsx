import {Modal} from "react-bootstrap";
import React, {useContext, useEffect, useState} from "react";
import {useGetSingleInvestmentDataQuery} from "../../api/slices/investmentSlice.js";
import {SettingsContext} from "../../contexts/SettingsContext.jsx";
import Spinner from 'react-bootstrap/Spinner';


export default function ShowDetails({handleCloseModal, element}) {
    // const [investment,setInvestment] = useState();
    const {applicationSettings} = useContext(SettingsContext);
    //
    // const {
    //     data: getSingleInvestmentData,
    //     isFetching: singleInvestmentFetching,
    //     isError: singleInvestmentDataError,
    // } = useGetSingleInvestmentDataQuery({
    //     id: id,
    // });
    // useEffect(() => {
    //     if (id && getSingleInvestmentData?.data) {
    //         setInvestment(getSingleInvestmentData?.data);
    //     }
    // }, [id])
    const {
        default_currency
    } = applicationSettings;


    return (
        <>
            <Modal show={true} centered onHide={handleCloseModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>Investment Details</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className="footable table table-bordered table-striped mb-0">
                        <tbody>
                        <tr>
                            <td width="50%">
                                <strong>Investor Name :</strong>
                            </td>
                            <td>{element?.investor_name}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Investment Amount :</strong>
                            </td>
                            <td> {default_currency + ' ' + element?.amount}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Note :</strong>
                            </td>
                            <td>{element?.note}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Date :</strong>
                            </td>
                            <td>
                                {element?.investment_date}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={handleCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>

        </>
    )
}