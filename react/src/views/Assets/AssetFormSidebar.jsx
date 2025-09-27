import React, { useEffect, useState } from "react";
import { notification } from "../../components/ToastNotification.jsx";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { useSidebarActions } from "../../components/GlobalSidebar";
import { useCreateAssetMutation, useGetSingleAssetDataQuery } from "../../api/slices/assetSlice.js";
import { useGetSectorListDataQuery } from "../../api/slices/sectorSlice.js";
import { useGetBankDataQuery } from "../../api/slices/bankSlice.js";
import { useGetExpenseCategoriesDataQuery } from "../../api/slices/expenseSlice.js";

const _initialAsset = {
  id: null,
  sector_id: "",
  account_id: "",
  category_id: "",
  date: "",
};

const _initialAssetData = [
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
];

export default function AssetFormSidebar({ assetId = null, onSuccess, asset = null }) {
  const [formData, setFormData] = useState(_initialAsset);
  const [assets, setAssets] = useState(_initialAssetData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [categories, setCategories] = useState([]);

  const { closeSidebar } = useSidebarActions();
  const [createAsset] = useCreateAssetMutation();

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
      setBankAccounts(getBankData?.data);
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

  const handleSectorChange = (e) => {
    setCategories([]);
    setFormData({ ...formData, sector_id: e.target.value });
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
      {
        name: "",
        description: "",
        qty: 0,
        unit_price: 0,
        total_price: 0,
        status: "",
        total_used: 0,
        total_damage: 0,
      },
    ]);
  };

  const removeOldAssetRow = (index) => {
    const updateAssets = [...assets];
    updateAssets.splice(index, 1);
    setAssets(updateAssets);
  };

  const assetSubmit = async (event, stay) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

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
        setAssets(_initialAssetData);
        setFormData(_initialAsset);
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
      
      <Form onSubmit={(e) => assetSubmit(e, false)}>
        {/* Sector Information Section */}
        <div className="mb-4">
          <h5 className="mb-3">Sector Information</h5>
          
          <Row className="g-3">
            {/* Sector */}
            <Col xs={12}>
              <Form.Group className="form-group mb-3">
                <Form.Label>Sector *</Form.Label>
                <Form.Select
                  value={formData.sector_id}
                  name="sector_id"
                  onChange={handleSectorChange}
                  required
                >
                  <option value="">Select Sector</option>
                  {sectors.length > 0 ? (
                    sectors.map((sector) => (
                      <option key={sector.value} value={sector.value}>
                        {sector.label}
                      </option>
                    ))
                  ) : (
                    <option disabled>No Sector was found</option>
                  )}
                </Form.Select>
                {errors.sector_id && (
                  <p className="error-message">{errors.sector_id[0]}</p>
                )}
              </Form.Group>
            </Col>

            {/* Categories */}
            <Col xs={12}>
              <Form.Group className="form-group mb-3">
                <Form.Label>Categories *</Form.Label>
                <Form.Select
                  value={formData.category_id}
                  name="category_id"
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories?.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Select Sector First</option>
                  )}
                </Form.Select>
                {errors.category_id && (
                  <p className="error-message">{errors.category_id[0]}</p>
                )}
              </Form.Group>
            </Col>

            {/* Date and Account Row - Responsive */}
            <Col xs={12} md={6}>
              <Form.Group className="form-group mb-3">
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                {errors.date && (
                  <p className="error-message">{errors.date[0]}</p>
                )}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="form-group mb-3">
                <Form.Label>Expense Account *</Form.Label>
                <Form.Select
                  value={formData.account_id}
                  name="account_id"
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Account</option>
                  {bankAccounts.length > 0 ? (
                    bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.bank_name} - {account.account_number}
                      </option>
                    ))
                  ) : (
                    <option disabled>No account was found</option>
                  )}
                </Form.Select>
                {errors.account_id && (
                  <p className="error-message">{errors.account_id[0]}</p>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Asset Details Section */}
        <div className="mb-4">
          <h5 className="mb-3">Asset Details</h5>
          
          {/* Desktop Table - Hidden on mobile */}
          <div className="d-none d-lg-block asset-form-sidebar-desktop-container">
            <Table size="sm" bordered className="asset-details-table asset-form-sidebar-table">
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
                      <td className="asset-form-sidebar-cell">
                        <Form.Control
                          type="text"
                          placeholder="e.g: Bed"
                          name="name"
                          value={asset.name}
                          onChange={(e) => handleAssetDataInputChange(e, index)}
                          size="sm"
                          className="asset-form-sidebar-cell"
                        />
                      </td>
                      <td className="asset-form-sidebar-cell">
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="e.g: Length: 200 CM"
                          name="description"
                          value={asset.description}
                          onChange={(e) => handleAssetDataInputChange(e, index)}
                          size="sm"
                          className="asset-form-sidebar-textarea"
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
          <div className="d-lg-none asset-form-sidebar-mobile-container">
            {assets &&
              assets?.length > 0 &&
              assets.map((asset, index) => (
                <div key={"asset-card-" + index} className="asset-card mb-3 p-3 border rounded asset-form-sidebar-card">
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
                  
                  <Row className="g-2 asset-form-sidebar-card-row">
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
                          className="asset-form-sidebar-mobile-textarea"
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

        {/* Submit Buttons - Responsive */}
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
      </Form>
    </div>
  );
}