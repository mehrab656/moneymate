import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {SettingsContext} from "../contexts/SettingsContext";

export default function BalanceTransfer() {
    const [loading, setLoading] = useState(true); // Initialize loading state as true
    const [transferHistories, setTransferHistories] = useState([]);
    const {applicationSettings} = useContext(SettingsContext);
    const {
        default_currency
    } = applicationSettings;

    const getTransferHistories = () => {
        axiosClient
            .get("/transfer/current-month")
            .then(({data}) => {
                setTransferHistories(data.data);
            })
            .catch((error) => {
                console.warn("Unable to fetch transfer histories", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getTransferHistories();
    }, []);

    return (
        <>

            <div className="table-responsive">
                <table className="table table-bordered custom-table">
                    <thead>
                    <tr className={"text-center"}>
                        <th>From Account</th>
                        <th>To Account</th>
                        <th>Transferred Amount</th>
                        <th>Transfer Date</th>
                    </tr>
                    </thead>
                    {loading && (
                        <tbody>
                        <tr>
                            <td colSpan={6}
                                className="text-center"> {/* Increase the colspan to match the number of columns */}
                                Loading...
                            </td>
                        </tr>
                        </tbody>
                    )}
                    {!loading && (
                        <tbody>
                        {transferHistories.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center">
                                    No account transaction found
                                </td>
                            </tr>
                        ) : (
                            transferHistories.map((transfer) => (
                                <tr key={transfer.id} className={"text-center"}>
                                    <td>{transfer.from_account}</td>
                                    <td>{transfer.to_account}</td>
                                    <td>{default_currency + transfer.amount}</td>
                                    <td>{transfer.transfer_date}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    )}
                </table>
            </div>
        </>
    );
}
