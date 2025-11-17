import React, { useEffect, useState } from "react";
import axiosClient from "../../../axios-client.js";
import MainLoader from "../../../components/loader/MainLoader.jsx";

export default function DebtDetails({ debtId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debt, setDebt] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchDebt = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get(`/debts/${debtId}`);
      setDebt(data);
    } catch (err) {
      setError(err?.message || "Failed to load debt");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/get-debt-history/${debtId}`);
      setHistory(data?.infos || []);
    } catch (err) {
      // Non-blocking error for history
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debtId) {
      fetchDebt();
      fetchHistory();
    }
  }, [debtId]);

  if (loading && !debt) {
    return <MainLoader loaderVisible={true} />;
  }

  if (error) {
    return <div className="p-3"><p className="text-danger">{error}</p></div>;
  }

  if (!debt) {
    return <div className="p-3"><p>No data found.</p></div>;
  }

  return (
    <div className="p-3">
      <div className="mb-3">
        <h5 className="mb-2">Debt Information</h5>
        <table className="table table-bordered table-striped">
          <tbody>
            <tr>
              <th style={{width: 160}}>ID</th>
              <td>{debt.id}</td>
            </tr>
            <tr>
              <th>Type</th>
              <td>{debt.type}</td>
            </tr>
            <tr>
              <th>Amount</th>
              <td>{debt.amount}</td>
            </tr>
            <tr>
              <th>Person</th>
              <td>{debt.person}</td>
            </tr>
            <tr>
              <th>Date</th>
              <td>{debt.date}</td>
            </tr>
            <tr>
              <th>Account</th>
              <td>{debt.account}</td>
            </tr>
            <tr>
              <th>Note</th>
              <td>{debt.note || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h5 className="mb-2">History</h5>
        <table className="table table-bordered table-striped">
          <thead>
            <tr className="text-center">
              <th>Type</th>
              <th>Amount</th>
              <th>Account</th>
              <th>Date</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td className="text-center" colSpan={5}>No history found</td>
              </tr>
            ) : (
              history.map((h) => (
                <tr key={`${h.type}-${h.date}-${h.amount}`} className="text-center">
                  <td>{h.type}</td>
                  <td>{h.amount}</td>
                  <td>{h.account}</td>
                  <td>{h.date}</td>
                  <td>{h.note || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}