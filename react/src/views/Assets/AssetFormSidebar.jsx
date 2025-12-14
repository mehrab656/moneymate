import React, { useEffect, useState, useContext, forwardRef, useImperativeHandle } from "react";
import { notification } from "../../components/ToastNotification.jsx";
import { Form, Button, Row, Col, Table, InputGroup } from "react-bootstrap";
import { useSidebarActions } from "../../components/GlobalSidebar";
import { useCreateAssetMutation, useGetSingleAssetDataQuery } from "../../api/slices/assetSlice.js";
import { useGetSectorListDataQuery } from "../../api/slices/sectorSlice.js";
import { useGetBankDataQuery } from "../../api/slices/bankSlice.js";
import { useGetExpenseCategoriesDataQuery } from "../../api/slices/expenseSlice.js";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";
import { createSelectStyles, createInputGroupTextStyle } from "../../styles/formThemeStyles.js";

const _initialAsset = {
  id: null,
  sector_id: "",
  account_id: "",
  category_id: "",
  date: "",
};

// Return a fresh copy of the initial asset rows to avoid shared references
const getInitialAssetRows = () => ([
  {
    name: "",
    description: "",
    qty: 0,
    unit_price: 0,
    total_price: 0,
    total_used: 0,
    total_damage: 0,
    status: true,
  },
]);

export default forwardRef(function AssetFormSidebar({ assetId = null, onSuccess, asset = null, formId: formIdProp = null, hideInternalFooter = false }, ref) {
  const [formData, setFormData] = useState(_initialAsset);
  // Use a fresh array/object for initial rows to prevent mutation of the template
  const [assets, setAssets] = useState(getInitialAssetRows());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [categories, setCategories] = useState([]);

  const { closeSidebar } = useSidebarActions();
  const [createAsset] = useCreateAssetMutation();
  const formId = formIdProp || "asset-form-sidebar-form";
  const theme = useTheme();
  const inputFontSize = "0.875rem";
  const selectStyles = createSelectStyles(theme, inputFontSize);
  const inputGroupTextStyle = createInputGroupTextStyle(theme);

  

  // API calls
  const {
    data: getSingleAssetData,
    isFetching: singleAssetFetching,
    isError: singleAssetDataError,
  } = useGetSingleAssetDataQuery({ id: assetId }, { skip: !assetId });

  const {
    data: getSectorListData,
    isFetching: sectorListFetching,
    isError: sectorListError,
  } = useGetSectorListDataQuery();

  const {
    data: getBankData,
    isFetching: bankAccListFetching,
    isError: bankAccListError,
  } = useGetBankDataQuery({
    currentPage: "",
    pageSize: 100,
  });

  const {
    data: getexpenseCategoriesData,
    isFetching: expenseCategoriesFetching,
    isError: expenseCategoriesDataError,
  } = useGetExpenseCategoriesDataQuery(
    { id: formData?.sector_id },
    { skip: formData?.sector_id === "" }
  );

  // Load asset data when component mounts or assetId changes
  useEffect(() => {
    if (asset) {
      // Use passed asset prop directly
      const assetData = asset;
      setFormData({
        id: assetData.id || null,
        sector_id: assetData.sector_id || "",
        account_id: assetData.account_id || "",
        category_id: assetData.category_id || "",
        date: assetData.date || "",
      });
      
      // Set assets data
      setAssets(
        assetData?.assets
          ? (typeof assetData.assets === 'string' ? JSON.parse(assetData.assets) : assetData.assets)
          : _initialAssetData
      );
    } else if (getSingleAssetData?.data) {
      // Use API data when no asset prop is provided
      const assetData = getSingleAssetData?.data;
      setFormData({
        id: assetData.id || null,
        sector_id: assetData.sector_id || "",
        account_id: assetData.account_id || "",
        category_id: assetData.category_id || "",
        date: assetData.date || "",
      });
      
      // Set categories if available
      setCategories(getSingleAssetData?.categories ?? []);
      
      // Set assets data
      setAssets(
        assetData?.assets
          ? JSON.parse(assetData.assets)
          : _initialAssetData
      );
    }
  }, [getSingleAssetData, assetId, asset]);

  // Load categories when sector changes (for both new assets and editing)
  useEffect(() => {
    if (getexpenseCategoriesData?.categories) {
      setCategories(getexpenseCategoriesData?.categories);
    }
  }, [getexpenseCategoriesData]);

  // Load sectors and bank accounts
  useEffect(() => {
    if (getSectorListData?.data) {
      setSectors(getSectorListData?.data);
    }
    if (getBankData?.data) {
      // Normalize bank accounts to a consistent shape used across the form
      const normalized = getBankData.data.map(({ account_id, bank_name, account_number, balance }) => ({
        account_id: String(account_id ?? ""),
        bank_name: bank_name ?? "",
        account_number: account_number ?? "",
        label: `${bank_name ?? ""} - ${account_number ?? ""}`,
        // store numeric balance for client-side checks
        balance: (typeof balance === "number") ? balance : Number(String(balance ?? "0").replace(/,/g, "")),
      }));
      setBankAccounts(normalized);
    }
  }, [getSectorListData, getBankData]);

  // Set default date
  useEffect(() => {
    if (formData?.date === "") {
      setFormData({
        ...formData,
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [formData?.date]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSectorChange = (opt) => {
    setCategories([]);
    setFormData({ ...formData, sector_id: opt?.value || "" });
  };

  const handleCategorySelect = (opt) => {
    setFormData({ ...formData, category_id: opt?.value || "" });
  };

  const handleAccountSelect = (opt) => {
    setFormData({ ...formData, account_id: opt?.value || "" });
  };

  const handleAssetDataInputChange = (e, index) => {
    const { name, value } = e.target;
    const updateAssets = [...assets];
    updateAssets[index][name] = value;
    setAssets(updateAssets);
  };

  const handleTotalPrice = (index) => {
    const _thisAsset = assets[index];
    const qty = _thisAsset.qty;
    const unit_price = _thisAsset.unit_price;
    const totalPrice = qty * unit_price;
    const updateAssets = [...assets];

    updateAssets[index]["total_price"] = totalPrice;
    setAssets(updateAssets);
  };

  const addNewAssetRow = () => {
    setAssets([
      ...assets,
      { ...getInitialAssetRows()[0] },
    ]);
  };

  const removeOldAssetRow = (index) => {
    const updateAssets = [...assets];
    updateAssets.splice(index, 1);
    setAssets(updateAssets);
  };

  // Helper to parse balances like "12,345.00" into numbers
  const parseMoney = (val) => {
    if (typeof val === "number") return val;
    const s = String(val ?? "0");
    return Number(s.replace(/,/g, ""));
  };

  // Compute total planned cost from asset rows
  const getTotalPlannedCost = () => {
    return assets.reduce((sum, a) => {
      const qty = Number(a.qty || 0);
      const unit = Number(a.unit_price || 0);
      const lineTotal = a.total_price != null ? Number(a.total_price) : qty * unit;
      return sum + (isNaN(lineTotal) ? 0 : lineTotal);
    }, 0);
  };

  const assetSubmit = async (event, stay) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    // Client-side guard: ensure sufficient account balance before submitting
    try {
      const selectedAccount = bankAccounts.find(
        (a) => String(a.account_id) === String(formData.account_id)
      );
      const available = parseMoney(selectedAccount?.balance);
      const required = getTotalPlannedCost();
      if (!selectedAccount) {
        setLoading(false);
        setErrors({ account_id: ["Please select a valid bank account."] });
        notification("error", "Error!", "Please select a valid bank account.");
        return;
      }
      if (available < required) {
        setLoading(false);
        setErrors({ account_id: ["Insufficient balance in selected account."] });
        notification(
          "error",
          "Error!",
          "Insufficient account balance for this expense."
        );
        return;
      }
    } catch (e) {
      // If any parsing fails, proceed to server which will validate
    }

    let _formData = new FormData();
    _formData.append("sector_id", formData.sector_id);
    _formData.append("category_id", formData.category_id);
    _formData.append("account_id", formData.account_id);
    _formData.append("date", formData.date);
    _formData.append("assets", JSON.stringify(assets));
    
    if (assetId) {
      _formData.append("id", assetId);
    }

    const url = assetId ? `/asset/${assetId}` : `/asset/add`;

    try {
      const data = await createAsset({ url: url, formData: _formData }).unwrap();
      notification("success", data?.message, data?.description);

      if (!stay) {
        onSuccess?.();
        closeSidebar(); // Close the sidebar
      } else {
        // Reset to fresh initial values (avoid using a mutated shared template)
        setAssets(getInitialAssetRows());
        setFormData({ ..._initialAsset });
      }
    } catch (err) {
      notification(
        "error",
        err?.message || "An error occurred",
        err?.description || "Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Expose imperative methods for sticky footer actions (Save / Save and Exit)
  useImperativeHandle(ref, () => ({
    save: () => {
      // Programmatic submit that keeps the sidebar open
      assetSubmit({ preventDefault: () => {} }, true);
    },
    saveAndExit: () => {
      // Programmatic submit that closes the sidebar
      assetSubmit({ preventDefault: () => {} }, false);
    },
  }));

  if (singleAssetFetching) {
    return (
      <div className="d-flex justify-content-center align-items-center asset-form-sidebar-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-form-sidebar">
      
      <Form id={formId} onSubmit={(e) => assetSubmit(e, true)}>
        {/* Sector Information Section */}
        <div className="mb-4">
          <h5 className="mb-3">Sector Information</h5>
          
          <Row className="g-3">
            {/* Sector */}
            <Col xs={12}>
              <InputGroup className="mb-3" size="sm">
                <InputGroup.Text id="sector_id_label" style={inputGroupTextStyle}>Sector *</InputGroup.Text>
                <div className="flex-grow-1" aria-describedby="sector_id_label">
                  <Select
                    classNamePrefix="select"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isClearable
                    value={
                      sectors?.length
                        ? sectors
                            .map(({ id, label }) => ({ value: id, label }))
                            .find((opt) => opt.value === (formData?.sector_id || "")) || null
                        : null
                    }
                    onChange={handleSectorChange}
                    options={sectors.map(({ id, label }) => ({ value: id, label }))}
                  />
                </div>
              </InputGroup>
              {errors.sector_id && (
                <p className="error-message">{errors.sector_id[0]}</p>
              )}
            </Col>

            {/* Account */}
             <Col xs={12} md={12}>
              <InputGroup className="mb-3" size="sm">
                <InputGroup.Text id="account_id_label" style={inputGroupTextStyle}>Expense Account *</InputGroup.Text>
                <div className="flex-grow-1" aria-describedby="account_id_label">
                  <Select
                    classNamePrefix="select"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isClearable
                    value={
                      bankAccounts?.length
                        ? bankAccounts
                            .map(({ account_id, label }) => ({ value: account_id, label }))
                            .find((opt) => String(opt.value) === String(formData?.account_id || "")) || null
                        : null
                    }
                    onChange={handleAccountSelect}
                    options={bankAccounts.map(({ account_id, label }) => ({ value: account_id, label }))}
                  />
                </div>
              </InputGroup>
              {errors.account_id && (
                <p className="error-message">{errors.account_id[0]}</p>
              )}
            </Col>

            {/* Categories */}
            <Col xs={12} md={6}>
              <InputGroup className="mb-3" size="sm">
                <InputGroup.Text id="category_id_label" style={inputGroupTextStyle}>Categories *</InputGroup.Text>
                <div className="flex-grow-1" aria-describedby="category_id_label">
                  <Select
                    classNamePrefix="select"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isClearable
                    value={
                      categories?.length
                        ? categories
                            .map(({ id, name }) => ({ value: id, label: name }))
                            .find((opt) => opt.value === (formData?.category_id || "")) || null
                        : null
                    }
                    onChange={handleCategorySelect}
                    options={categories.map(({ id, name }) => ({ value: id, label: name }))}
                  />
                </div>
              </InputGroup>
              {errors.category_id && (
                <p className="error-message">{errors.category_id[0]}</p>
              )}
            </Col>

            {/* Date and Account Row - Responsive */}
            <Col xs={12} md={6}>
              <InputGroup className="mb-3" size="sm">
                <InputGroup.Text id="date_label" style={inputGroupTextStyle}>Date *</InputGroup.Text>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  aria-describedby="date_label"
                />
              </InputGroup>
              {errors.date && (
                <p className="error-message">{errors.date[0]}</p>
              )}
            </Col>
           
          </Row>
        </div>

        {/* Asset Details Section */}
        <div className="mb-4">
          <h5 className="mb-3">Asset Details</h5>
          
          {/* Desktop Table - Hidden on mobile */}
          <div className="d-none d-lg-block sector-form-sidebar-desktop-container">
            <Table size="sm" bordered className="sector-form-sidebar-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assets &&
                  assets?.length > 0 &&
                  assets.map((asset, index) => (
                    <tr key={"asset-" + index}>
                      <td className="sector-form-sidebar-cell">
                        <Form.Control
                          type="text"
                          placeholder="e.g: Bed"
                          name="name"
                          value={asset.name}
                          onChange={(e) => handleAssetDataInputChange(e, index)}
                          size="sm"
                        />
                      </td>
                      <td className="sector-form-sidebar-cell">
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="e.g: Length: 200 CM"
                          name="description"
                          value={asset.description}
                          onChange={(e) => handleAssetDataInputChange(e, index)}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          name="qty"
                          step={1}
                          min={1}
                          value={asset.qty}
                          onChange={(e) => {
                            handleAssetDataInputChange(e, index);
                            handleTotalPrice(index);
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          name="unit_price"
                          min={1}
                          value={asset.unit_price}
                          onChange={(e) => {
                            handleAssetDataInputChange(e, index);
                            handleTotalPrice(index);
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          name="total_price"
                          value={asset.total_price}
                          onChange={(e) => handleAssetDataInputChange(e, index)}
                          size="sm"
                          readOnly
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={addNewAssetRow}
                            className="flex-shrink-0"
                          >
                            +
                          </Button>
                          {index > 0 && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeOldAssetRow(index)}
                              className="flex-shrink-0"
                            >
                              -
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile Card Layout - Visible only on mobile/tablet */}
          <div className="d-lg-none sector-form-sidebar-mobile-container">
            {assets &&
              assets?.length > 0 &&
              assets.map((asset, index) => (
                <div key={"asset-card-" + index} className="sector-card mb-3 p-3 border rounded sector-form-sidebar-card">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Asset #{index + 1}</h6>
                    <div className="d-flex gap-1 flex-shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={addNewAssetRow}
                      >
                        +
                      </Button>
                      {index > 0 && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeOldAssetRow(index)}
                        >
                          -
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Row className="g-2 sector-form-sidebar-card-row">
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="small">Name *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g: Bed"
                          name="name"
                          value={asset.name}
                          onChange={(e) => handleAssetDataInputChange(e, index)}
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="small">Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="e.g: Length: 200 CM"
                          name="description"
                          value={asset.description}
                          onChange={(e) => handleAssetDataInputChange(e, index)}
                          size="sm"
                          className="sector-form-sidebar-mobile-textarea"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="small">Qty *</Form.Label>
                        <Form.Control
                          type="number"
                          name="qty"
                          step={1}
                          min={1}
                          value={asset.qty}
                          onChange={(e) => {
                            handleAssetDataInputChange(e, index);
                            handleTotalPrice(index);
                          }}
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="small">Unit Price *</Form.Label>
                        <Form.Control
                          type="number"
                          name="unit_price"
                          min={1}
                          value={asset.unit_price}
                          onChange={(e) => {
                            handleAssetDataInputChange(e, index);
                            handleTotalPrice(index);
                          }}
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="small">Total Price</Form.Label>
                        <Form.Control
                          type="text"
                          name="total_price"
                          value={asset.total_price}
                          onChange={(e) => handleAssetDataInputChange(e, index)}
                          size="sm"
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              ))}
          </div>
          
          {errors?.assets && (
            <p className="error-message mt-2">{errors?.assets[0]}</p>
          )}
        </div>

        {/* Submit Buttons - Responsive (hidden when using sticky footer) */}
        {!hideInternalFooter && (
          <Row className="g-2">
            <Col xs={12}>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                {assetId ? (
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="flex-fill flex-sm-fill-0"
                  >
                    {loading ? "Updating..." : "Update Asset"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline-primary"
                      onClick={(e) => assetSubmit(e, true)}
                      disabled={loading}
                      className="flex-fill flex-sm-fill-0"
                    >
                      {loading ? "Creating..." : "Create & Add More"}
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      className="flex-fill flex-sm-fill-0"
                    >
                      {loading ? "Creating..." : "Create & Close"}
                    </Button>
                  </>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Form>
    </div>
  );
})
