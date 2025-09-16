import React, {useContext, useEffect, useState} from "react";
import WizCard from "../../components/WizCard";
import axiosClient from "../../axios-client";
import Pagination from "react-bootstrap/Pagination";
import Badge from "react-bootstrap/Badge";
import {SettingsContext} from "../../contexts/SettingsContext";
import {useNavigate} from "react-router-dom";
import MainLoader from "../../components/loader/MainLoader";

export default function SubscriptionHistory() {

    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const navigate = useNavigate();

    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        default_currency,
        num_data_per_page
    } = applicationSettings;


    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    useEffect(() => {
        document.title = "Subscription History";
        getSubscriptions(currentPage, pageSize);
    }, [currentPage, pageSize]); // Fetch categories when currentPage changes


    if (userRole === "user") {
        navigate("/dashboard");
    }


    const getSubscriptions = (page, pageSize) => {
        setLoading(true);
        axiosClient
            .get("/subscriptions", {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setSubscriptions(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const paginationItems = [];
    for (let i = 1; i <= totalPages; i++) {
        paginationItems.push(
            <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => handlePageChange(i)}>
                {i}
            </Pagination.Item>
        );
    }


    return (
        <>
        <MainLoader loaderVisible={loading} />
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Subscription Histories</h1>

            </div>
            <WizCard className="animated fadeInDown">
                <div className="table-responsive-sm">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr className={'text-center'}>
                            <th>User Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Amount</th>
                        </tr>
                        </thead>
                        {loading && (
                            <tbody>
                            <tr>
                                <td colSpan={4} className="text-center">
                                    Loading...
                                </td>
                            </tr>
                            </tbody>
                        )}
                        {!loading && (
                            <tbody>
                            {subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center">
                                        No subscription data found
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((subscription) => (
                                    <tr className={'text-center'} key={subscription.id}>
                                        <td>{subscription.user_name}</td>
                                        <td>{subscription.current_period_start}</td>
                                        <td>{subscription.current_period_end}</td>
                                        <td>
                                            <Badge
                                                className={subscription.status === "Active" ? "badge-active" : "badge-inactive"}>
                                                {subscription.status}
                                            </Badge>
                                        </td>
                                        <td>{default_currency + subscription.amount}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        )}
                    </table>
                </div>
                {totalPages > 1 && (
                    <Pagination>
                        <Pagination.Prev
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        />
                        {paginationItems}
                        <Pagination.Next
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        />
                    </Pagination>
                )}
            </WizCard>
        </>
    );
}
