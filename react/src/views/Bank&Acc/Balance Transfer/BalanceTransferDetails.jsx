import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../../axios-client.js";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";

export default function BalanceTransferDetails({ transferId }) {
  const { applicationSettings, userRole } = useContext(SettingsContext);
  const { default_currency } = applicationSettings;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transfer, setTransfer] = useState(null);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(`/transfer/histories/${transferId}`)
      .then(({ data }) => {
        setTransfer(data?.data || data);
      })
      .catch((e) => {
        setError("Unable to load transfer details");
      })
      .finally(() => setLoading(false));
  }, [transferId]);

  if (loading) return <MainLoader loaderVisible={true} />;
  if (error) return <div className="text-danger p-2">{error}</div>;
  if (!transfer) return <div className="p-2">No data found.</div>;

  return (
    <div className="p-2">
      <h5 className="title-text mb-3">Transfer Details</h5>
      <div className="mb-2"><strong>ID:</strong> {transfer.id}</div>
      <div className="mb-2"><strong>From Account:</strong> {transfer.from_account}</div>
      <div className="mb-2"><strong>To Account:</strong> {transfer.to_account}</div>
      <div className="mb-2">
        <strong>Amount:</strong> {default_currency}
        {transfer.amount}
      </div>
      <div className="mb-2"><strong>Transfer Date:</strong> {transfer.transfer_date}</div>
      <div className="mb-2"><strong>Note:</strong> {transfer.note || "-"}</div>
      {userRole === "admin" && (
        <div className="text-muted mt-2">Internal ID: {transfer.id}</div>
      )}
    </div>
  );
}