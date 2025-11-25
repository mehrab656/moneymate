import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../../axios-client.js";
import DatePicker from "react-datepicker";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { useStateContext } from "../../../contexts/ContextProvider.jsx";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";

export default function BalanceTransferFormSidebar({ mode = "create", transferId = null, onSuccess = () => {} }) {
  const { closeSidebar } = useSidebarActions();
  const { setNotification } = useStateContext();
  const { applicationSettings } = useContext(SettingsContext);

  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [insufficientBalance, setInsufficientBalance] = useState("");

  const [transfer, setTransfer] = useState({
    from_account_id: "",
    to_account_id: "",
    amount: "",
    transfer_date: null,
    note: "",
  });

  const [selectedFromAccountId, setSelectedFromAccountId] = useState("");
  const [selectedToAccountId, setSelectedToAccountId] = useState("");
  const [transferDate, setTransferDate] = useState(null);

  const handleTransferDateChange = (date) => {
    setTransferDate(date);
  };

  const loadBankAccounts = () => {
    return axiosClient.get("/all-bank-account").then(({ data }) => {
      setBankAccounts(data.data || []);
    });
  };

  const loadTransferDetails = async () => {
    if (mode !== "edit" || !transferId) return;
    try {
      const { data } = await axiosClient.get(`/transfer/histories/${transferId}`);
      const t = data?.data || data; // support either shape
      setTransfer({
        from_account_id: t.from_account_id ?? "",
        to_account_id: t.to_account_id ?? "",
        amount: t.amount ?? "",
        transfer_date: t.transfer_date ?? null,
        note: t.note ?? "",
      });
      setSelectedFromAccountId(t.from_account_id ? String(t.from_account_id) : "");
      setSelectedToAccountId(t.to_account_id ? String(t.to_account_id) : "");
      setTransferDate(t.transfer_date ? new Date(t.transfer_date) : new Date());
    } catch (e) {
      // If details endpoint not present, keep as create-like with defaults
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.resolve()
      .then(loadBankAccounts)
      .then(loadTransferDetails)
      .finally(() => {
        if (!transferDate) setTransferDate(new Date());
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, transferId]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setInsufficientBalance("");

    const payload = {
      ...transfer,
      transfer_date: transferDate
        ? new Date(transferDate.getTime() - transferDate.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0]
        : null,
    };

    try {
      if (mode === "edit" && transferId) {
        await axiosClient.put(`/bank-accounts/transfer-amount/${transferId}`, payload);
        setNotification("Transfer updated successfully");
      } else {
        await axiosClient.post("/bank-accounts/transfer-amount", payload);
        setNotification("Account transfer has been done");
      }

      onSuccess();
      closeSidebar();
    } catch (error) {
      const response = error?.response;
      if (response && response.status === 422) {
        setErrors(response.data.errors || {});
      } else {
        const msg = response?.data?.message || "Transfer failed";
        setInsufficientBalance(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <MainLoader loaderVisible={loading} />
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="custom-form-label">From Account</label>
          <select
            className="custom-form-control"
            value={selectedFromAccountId}
            id="from-bank-account"
            name="from_account_id"
            onChange={(event) => {
              const value = event.target.value || "";
              setSelectedFromAccountId(value);
              setTransfer({ ...transfer, from_account_id: value ? Number(value) : "" });
            }}
          >
            <option value="">Select a bank account</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.account_id}>
                {account.bank_name} - {account.account_number} - Balance ({account.balance})
              </option>
            ))}
          </select>
          {errors.from_account_id && (
            <p className="error-message mt-2">{errors.from_account_id[0]}</p>
          )}
        </div>

        <div className="form-group">
          <label className="custom-form-label">To Account</label>
          <select
            className="custom-form-control"
            value={selectedToAccountId}
            id="to-bank-account"
            name="to_account_id"
            onChange={(event) => {
              const value = event.target.value || "";
              setSelectedToAccountId(value);
              setTransfer({ ...transfer, to_account_id: value ? Number(value) : "" });
            }}
          >
            <option value="">Select a bank account</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.account_id}>
                {account.bank_name} - {account.account_number} - Balance ({account.balance})
              </option>
            ))}
          </select>
          {errors.to_account_id && (
            <p className="error-message mt-2">{errors.to_account_id[0]}</p>
          )}
        </div>

        <div className="form-group">
          <label className="custom-form-label">Amount</label>
          <input
            className="custom-form-control"
            type="number"
            name="amount"
            value={transfer.amount}
            onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
          />
          {errors.amount && <p className="error-message mt-2">{errors.amount[0]}</p>}
        </div>

        <div className="form-group">
          <label className="custom-form-label">Transfer Date</label>
          <DatePicker
            className="custom-form-control"
            selected={transferDate}
            onChange={handleTransferDateChange}
            onSelect={handleTransferDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="Transfer Date"
          />
          {errors.transfer_date && (
            <p className="error-message mt-2">{errors.transfer_date[0]}</p>
          )}
        </div>

        <div className="form-group">
          <label className="custom-form-label">Note</label>
          <input
            className="custom-form-control"
            type="text"
            name="note"
            value={transfer.note}
            onChange={(e) => setTransfer({ ...transfer, note: e.target.value })}
          />
        </div>

        {insufficientBalance && (
          <p className="error-message mt-2">{insufficientBalance}</p>
        )}

        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="custom-btn btn-add">
            {mode === "edit" ? "Update Transfer" : "Transfer Amount"}
          </button>
         
        </div>
      </form>
    </div>
  );
}
