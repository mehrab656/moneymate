import React, { useEffect, useState } from "react";
import WizCard from "../../../components/WizCard.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";
import { Col, Form, Row, Button } from "react-bootstrap";
import Select from "react-select";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { useGetBankDataQuery } from "../../../api/slices/bankSlice.js";
import { useGetCategoryListDataQuery } from "../../../api/slices/categorySlice.js";
import {
  useCreateIncomeMutation,
  useGetSingleIncomeDataQuery,
} from "../../../api/slices/incomeSlice.js";

const defaultReference = [
  { value: "air-bnb", label: "Airbnb" },
  { value: "booking", label: "Booking.com" },
  { value: "vrbo", label: "VRBO" },
  { value: "expedia", label: "Expedia" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "bankTransfer", label: "Bank Transfer" },
];

const defaultIncomeType = [
  { value: "reservation", label: "Reservation" },
  { value: "rent", label: "Rent" },
  { value: "electricity_bill", label: "Electricity Bill" },
  { value: "internet_bill", label: "Internet Bill" },
  { value: "service", label: "Service Provide" },
  { value: "others", label: "Others" },
];

const _initialIncome = {
  id: null,
  amount: "",
  description: "",
  reference: defaultReference[0],
  income_type: defaultIncomeType[0],
  date: "",
  checkin_date: "",
  checkout_date: "",
  note: "",
  attachment: "",
  account: [],
  category: [],
};

export default function IncomeFormSidebar({ incomeId, onSuccess }) {
  const [income, setIncome] = useState(_initialIncome);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const { closeSidebar } = useSidebarActions();

  const { data: getBankData } = useGetBankDataQuery({ currentPage: "", pageSize: 100 });
  const { data: getCategoryListData, isFetching: categoryIsFetching } =
    useGetCategoryListDataQuery({ categoryType: "income" });
  const { data: getSingleIncomeData } = useGetSingleIncomeDataQuery(
    { id: incomeId },
    { skip: !incomeId }
  );
  const [createIncome] = useCreateIncomeMutation();

  useEffect(() => {
    if (getBankData?.data?.length > 0) {
      const modifiedAccounts = getBankData.data.map(({ id, bank_name, account_number, slug }) => ({
        value: slug ?? id,
        label: `${bank_name}(${account_number})`,
      }));
      setAccounts(modifiedAccounts);
    }
    if (getCategoryListData?.data?.length > 0) {
      const modifiedCategories = getCategoryListData.data.map((c) => ({
        value: c?.value ?? c?.id ?? c?.slug,
        label: c?.label ?? c?.name ?? c?.category_name ?? String(c?.id ?? "Category"),
      }));
      setCategories(modifiedCategories);
      setIncome((prev) => (
        prev?.category && prev.category.value
          ? prev
          : { ...prev, category: modifiedCategories[0] }
      ));
    }
    if (incomeId && getSingleIncomeData?.data) {
      // The backend returns account/category/reference/income_type in {value,label} shape
      const serverIncome = getSingleIncomeData.data;
      setIncome((prev) => ({
        ...prev,
        ...serverIncome,
      }));
    }
  }, [incomeId, getSingleIncomeData, getBankData, getCategoryListData]);

  useEffect(() => {
    if (!income?.date) {
      setIncome((prev) => ({ ...prev, date: new Date().toISOString().split("T")[0] }));
    }
  }, [income?.date]);

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setIncome({ ...income, attachment: file });
  };

  const submitIncome = async (event, stay = false) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    if (!income?.account?.value) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, account: ["Account is required."] }));
      notification("error", "Account required", "Please select an account.");
      return;
    }
    if (!income?.category?.value) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, category: ["Category is required."] }));
      notification("error", "Category required", "Please select a category.");
      return;
    }
    if (!income?.amount || Number(income.amount) <= 0) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, amount: ["Enter a positive amount."] }));
      notification("error", "Amount invalid", "Please enter a valid amount.");
      return;
    }

    const formData = new FormData();
    formData.append("account", income.account.value);
    formData.append("income_type", income?.income_type?.value ?? "");
    formData.append("amount", income.amount);
    formData.append("category", income.category.value);
    formData.append("description", income.description ?? "");
    formData.append("note", income.note ?? "");
    formData.append("reference", income?.reference?.value ?? "");
    formData.append("date", income.date ?? "");
    formData.append("checkin_date", income.checkin_date ?? "");
    formData.append("checkout_date", income.checkout_date ?? "");
    if (income.attachment) {
      formData.append("attachment", income.attachment);
    }

    const url = incomeId ? `/income/${incomeId}` : "/income/add";
    try {
      const data = await createIncome({ url, formData }).unwrap();
      notification("success", data?.message, data?.description);
      if (stay) {
        setIncome({ ..._initialIncome, category: categories[0] ?? [], reference: defaultReference[0], income_type: defaultIncomeType[0] });
      } else {
        onSuccess?.();
        closeSidebar();
      }
    } catch (err) {
      if (err.status === 422) {
        setErrors(err?.errorData?.errors || {});
        notification(
          "error",
          err?.message || "Validation error",
          err?.description || "Please review the highlighted fields."
        );
      } else {
        notification(
          "error",
          err?.message || "An error occurred",
          err?.description || "Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const reservationSelected = (income?.income_type?.value ?? "") === "reservation";

  return (
    <div style={{ padding: 16 }}>
      <MainLoader loaderVisible={loading} />
      <WizCard className="animated fadeInDown">
        <Form onSubmit={(e) => submitIncome(e, false)}>
          <Row>
            <Col xs={12}>
              <Form.Group className="mb-3" controlId="description">
                <Form.Label style={{ marginBottom: 0 }} className="custom-form-label">Description</Form.Label>
                <Form.Control as="textarea" rows={3} value={income.description ?? ""} name="description"
                              onChange={(e) => setIncome({ ...income, description: e.target.value })}
                              placeholder="Enter description" />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="amount">
                <Form.Label style={{ marginBottom: 0 }} className="custom-form-label">Amount</Form.Label>
                <Form.Control type="number" placeholder="i.g: 50 AED" value={income.amount}
                              onChange={(e) => setIncome({ ...income, amount: e.target.value })} />
                {errors.amount && (
                  <p className="error-message">{errors.amount[0]}</p>
                )}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="account">
                <Form.Label style={{ marginBottom: 0 }} className="custom-form-label">Account</Form.Label>
                <Select classNamePrefix="select" value={income.account} isSearchable name="account" options={accounts}
                        onChange={(e) => {
                          setIncome({ ...income, account: e });
                          if (errors.account && e?.value) {
                            const next = { ...errors };
                            delete next.account;
                            setErrors(next);
                          }
                        }} />
                {errors.account && (
                  <p className="error-message">{errors.account[0]}</p>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="category">
                <Form.Label style={{ marginBottom: 0 }} className="custom-form-label">Category</Form.Label>
                <Select classNamePrefix="select" value={income.category} isSearchable name="category"
                        isLoading={categoryIsFetching} options={categories}
                        onChange={(e) => {
                          setIncome({ ...income, category: e });
                          if (errors.category && e?.value) {
                            const next = { ...errors };
                            delete next.category;
                            setErrors(next);
                          }
                        }} />
                {errors.category && (
                  <p className="error-message">{errors.category[0]}</p>
                )}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="date">
                <Form.Label style={{ marginBottom: 0 }} className="custom-form-label">Date</Form.Label>
                <Form.Control type="date" value={income.date}
                              onChange={(e) => setIncome({ ...income, date: e.target.value })} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="reference">
                <Form.Label style={{ marginBottom: 0 }} className="custom-form-label">Reference</Form.Label>
                <Select classNamePrefix="select" value={income.reference} isSearchable name="reference" options={defaultReference}
                        onChange={(e) => setIncome({ ...income, reference: e })} />
                {errors.reference && (
                  <p className="error-message">{errors.reference[0]}</p>
                )}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="income_type">
                <Form.Label style={{ marginBottom: 0 }} className="custom-form-label">Income Type</Form.Label>
                <Select classNamePrefix="select" value={income.income_type} isSearchable name="income_type" options={defaultIncomeType}
                        onChange={(e) => setIncome({ ...income, income_type: e })} />
                {errors.income_type && (
                  <p className="error-message">{errors.income_type[0]}</p>
                )}
              </Form.Group>
            </Col>
          </Row>

          {reservationSelected && (
            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3" controlId="checkin_date">
                  <Form.Label style={{ marginBottom: 0 }} className="custom-form-label">Check-in Date</Form.Label>
                  <Form.Control type="date" value={income.checkin_date}
                                onChange={(e) => setIncome({ ...income, checkin_date: e.target.value })} />
                  {errors.checkin_date && (
                    <p className="error-message">{errors.checkin_date[0]}</p>
                  )}
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3" controlId="checkout_date">
                  <Form.Label style={{ marginBottom: 0 }} className="custom-form-label">Check-out Date</Form.Label>
                  <Form.Control type="date" value={income.checkout_date}
                                onChange={(e) => setIncome({ ...income, checkout_date: e.target.value })} />
                  {errors.checkout_date && (
                    <p className="error-message">{errors.checkout_date[0]}</p>
                  )}
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="note">
                <Form.Label style={{ marginBottom: 0 }} className="custom-form-label">Note</Form.Label>
                <Form.Control as="textarea" rows={3} value={income.note ?? ""} name="note"
                              onChange={(e) => setIncome({ ...income, note: e.target.value })} />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Add Attachment</Form.Label>
                <Form.Control type="file" onChange={handleFileInputChange} />
                {errors.attachment && (
                  <p className="error-message">{errors.attachment[0]}</p>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2">
            <Col xs={12}>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                {incomeId ? (
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Updating..." : "Update Income"}
                  </Button>
                ) : (
                  <>
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? "Saving..." : "Add Income"}
                    </Button>
                    <Button type="button" variant="success" disabled={loading} onClick={(e) => submitIncome(e, true)}>
                      {loading ? "Saving..." : "Save & Add Another"}
                    </Button>
                  </>
                )}
                <Button type="button" variant="outline-secondary" onClick={closeSidebar}>
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </WizCard>
    </div>
  );
}

