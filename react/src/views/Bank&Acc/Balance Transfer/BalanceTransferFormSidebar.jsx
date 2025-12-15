import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../../axios-client.js";
import DatePicker from "react-datepicker";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { useStateContext } from "../../../contexts/ContextProvider.jsx";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import { Form, Row, Col, InputGroup, Button } from "react-bootstrap";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle, createSelectStyles } from "../../../styles/formThemeStyles.js";
import Select from "react-select";

export default function BalanceTransferFormSidebar({ mode = "create", transferId = null, onSuccess = () => {}, formId: formIdProp = null, hideInternalFooter = false }) {
  const { closeSidebar } = useSidebarActions();
  const { setNotification } = useStateContext();
  const { applicationSettings } = useContext(SettingsContext);
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const selectStyles = createSelectStyles(theme);

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
  const formId = formIdProp || "balance-transfer-form-sidebar-form";

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
    e?.preventDefault?.();
    setLoading(true);
    setErrors({});
    setInsufficientBalance("");
    const submitter = e?.nativeEvent?.submitter;
    const action = submitter?.getAttribute?.('data-action') || submitter?.value || '';
    const addMore = action === 'save';

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
        if (addMore) {
          setTransfer({
            from_account_id: "",
            to_account_id: "",
            amount: "",
            transfer_date: null,
            note: "",
          });
          setSelectedFromAccountId("");
          setSelectedToAccountId("");
          setTransferDate(new Date());
          setErrors({});
          setInsufficientBalance("");
        }
      }

      onSuccess();
      if (mode === "edit" || !addMore) {
        closeSidebar();
      }
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
      <Form id={formId} onSubmit={submit}>
        <Row className="g-3">
          <Col xs={12} md={12}>
            <InputGroup className={errors.from_account_id ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="from_account_id" style={inputGroupTextStyle}>From Account *</InputGroup.Text>
              <div className="flex-grow-1" aria-describedby="from_account_id">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  value={
                    (bankAccounts || [])
                      .map((account) => ({
                        value: String(account.account_id),
                        label: `${account.bank_name} - ${account.account_number} - Balance (${account.balance})`,
                      }))
                      .find((opt) => String(opt.value) === String(selectedFromAccountId || "")) || null
                  }
                  options={(bankAccounts || []).map((account) => ({
                    value: String(account.account_id),
                    label: `${account.bank_name} - ${account.account_number} - Balance (${account.balance})`,
                  }))}
                  placeholder={"Select a bank account"}
                  onChange={(opt) => {
                    const value = opt?.value || "";
                    setSelectedFromAccountId(value);
                    setTransfer({ ...transfer, from_account_id: value ? Number(value) : "" });
                    if (errors.from_account_id) {
                      const next = { ...errors };
                      delete next.from_account_id;
                      setErrors(next);
                    }
                  }}
                />
              </div>
            </InputGroup>
            {errors.from_account_id && (
              <p className="error-message mt-2">{errors.from_account_id[0]}</p>
            )}
          </Col>

          <Col xs={12} md={12}>
            <InputGroup className={errors.to_account_id ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="to_account_id" style={inputGroupTextStyle}>To Account *</InputGroup.Text>
              <div className="flex-grow-1" aria-describedby="to_account_id">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  value={
                    (bankAccounts || [])
                      .map((account) => ({
                        value: String(account.account_id),
                        label: `${account.bank_name} - ${account.account_number} - Balance (${account.balance})`,
                      }))
                      .find((opt) => String(opt.value) === String(selectedToAccountId || "")) || null
                  }
                  options={(bankAccounts || []).map((account) => ({
                    value: String(account.account_id),
                    label: `${account.bank_name} - ${account.account_number} - Balance (${account.balance})`,
                  }))}
                  placeholder={"Select a bank account"}
                  onChange={(opt) => {
                    const value = opt?.value || "";
                    setSelectedToAccountId(value);
                    setTransfer({ ...transfer, to_account_id: value ? Number(value) : "" });
                    if (errors.to_account_id) {
                      const next = { ...errors };
                      delete next.to_account_id;
                      setErrors(next);
                    }
                  }}
                />
              </div>
            </InputGroup>
            {errors.to_account_id && (
              <p className="error-message mt-2">{errors.to_account_id[0]}</p>
            )}
          </Col>

          <Col xs={12} md={12}>
            <InputGroup className={errors.amount ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="amount" style={inputGroupTextStyle}>Amount *</InputGroup.Text>
              <Form.Control
                aria-describedby="amount"
                type="number"
                name="amount"
                value={transfer.amount}
                onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
                required
              />
            </InputGroup>
            {errors.amount && <p className="error-message mt-2">{errors.amount[0]}</p>}
          </Col>

          <Col xs={12} md={12}>
            <InputGroup className={errors.transfer_date ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="transfer_date" style={inputGroupTextStyle}>Transfer Date *</InputGroup.Text>
              <div className="flex-grow-1" aria-describedby="transfer_date">
                <DatePicker
                  className="custom-form-control"
                  selected={transferDate}
                  onChange={handleTransferDateChange}
                  onSelect={handleTransferDateChange}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Transfer Date"
                />
              </div>
            </InputGroup>
            {errors.transfer_date && (
              <p className="error-message mt-2">{errors.transfer_date[0]}</p>
            )}
          </Col>

          <Col xs={12} md={12}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="note" style={inputGroupTextStyle}>Note</InputGroup.Text>
              <Form.Control
                aria-describedby="note"
                type="text"
                name="note"
                value={transfer.note}
                onChange={(e) => setTransfer({ ...transfer, note: e.target.value })}
              />
            </InputGroup>
          </Col>
        </Row>

        {insufficientBalance && (
          <p className="error-message mt-2">{insufficientBalance}</p>
        )}

        {!hideInternalFooter && (
          <div className="d-flex gap-2 justify-content-end mt-3">
            {mode === "edit" ? (
              <Button
                variant="warning"
                size="sm"
                type="submit"
                data-action="save_exit"
                disabled={loading}
              >
                Update
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  data-action="save"
                  disabled={loading}
                >
                  Transfer
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  type="submit"
                  data-action="save_exit"
                  disabled={loading}
                >
                  Transfer and Exit
                </Button>
              </>
            )}
            <Button
              variant="outline-secondary"
              size="sm"
              type="button"
              onClick={closeSidebar}
            >
              Cancel
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
}
