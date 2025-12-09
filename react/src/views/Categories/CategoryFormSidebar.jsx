import React, { useState, useEffect, useContext, forwardRef, useImperativeHandle } from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import Select from "react-select";
import { notification } from "../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../components/GlobalSidebar";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import {
  useCreateCategoryMutation,
  useGetCategorySectorListDataQuery,
  useGetSingleCategoryDataQuery,
  useUpdateCategoryMutation,
} from "../../api/slices/categorySlice.js";

const _initialCategoryData = {
  id: null,
  sector_id: "",
  name: "",
  type: "income",
};

export default forwardRef(function CategoryFormSidebar({ categoryId = null, onSuccess, formId: formIdProp = null, hideInternalFooter = false }, ref) {
  const [categoryData, setCategoryData] = useState(_initialCategoryData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState([]);

  const { closeSidebar } = useSidebarActions();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const formId = formIdProp || "category-form-sidebar-form";
  const { themeMode } = useContext(SettingsContext);
  const isDark = themeMode === "dark";
  const inputFontSize = "0.875rem";
  const selectStyles = {
    container: (base) => ({ ...base, fontSize: 14 }),
    control: (base, state) => ({
      ...base,
      minHeight: 36,
      height: 36,
      boxShadow: "none",
      borderColor: state.isFocused ? (isDark ? "#3a4149" : "#86b7fe") : (isDark ? "#3a4048" : "#c5ccd6"),
      backgroundColor: isDark ? "#1c1f24" : "#fff",
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
      '&:hover': { borderColor: state.isFocused ? (isDark ? "#3a4149" : "#86b7fe") : (isDark ? "#3a4048" : "#c5ccd6") },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 8px" }),
    indicatorsContainer: (base) => ({ ...base, height: 36 }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    }),
    input: (base) => ({ ...base, color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)" }),
    placeholder: (base) => ({ ...base, color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#23262b" : "#fff",
      border: `1px solid ${isDark ? "#2c3238" : "#dee2e6"}`,
      boxShadow: isDark ? "0 6px 12px rgba(0,0,0,0.35)" : "0 6px 12px rgba(0,0,0,0.15)",
    }),
    menuList: (base) => ({ ...base, backgroundColor: isDark ? "#23262b" : "#fff" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? isDark ? "#0C1A28" : "#e7f0fb"
        : state.isFocused
          ? isDark ? "#2d3238" : "#f2f2f2"
          : isDark ? "#23262b" : "#fff",
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
      ':active': { backgroundColor: isDark ? "#0C1A28" : "#e7f0fb" },
    }),
  };

  // API calls
  const {
    data: getSingleCategoryData,
    isFetching: singleCategoryFetching,
    isError: singleCategoryDataError,
  } = useGetSingleCategoryDataQuery({ id: categoryId }, { skip: !categoryId });

  const {
    data: getCategorySectorListData,
    isFetching: getCategorySectorListDataFetching,
    isError: getCategorySectorListDataError,
  } = useGetCategorySectorListDataQuery();

  // Load category data when component mounts or categoryId changes
  useEffect(() => {
    if (getSingleCategoryData) {
      const payload = getSingleCategoryData?.data ?? getSingleCategoryData;
      if (payload) {
        setCategoryData({
          id: payload.id,
          sector_id: payload.sector_id !== undefined && payload.sector_id !== null
            ? String(payload.sector_id)
            : "",
          name: payload.name || "",
          type: payload.type || "income",
        });
      }
    }
  }, [getSingleCategoryData]);

  // Load sectors data
  useEffect(() => {
    if (getCategorySectorListData?.data) {
      setSectors(getCategorySectorListData.data);
    }
  }, [getCategorySectorListData]);

  // When editing: map numeric sector_id (id) to slug value for the dropdown
  // NOTE: sector select now uses numeric IDs directly, so no mapping needed

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData({
      ...categoryData,
      [name]: value,
    });
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const categorySubmit = async (event, createMore = false) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    // Simple client validation since react-select cannot use required
    const missing = {
      name: !categoryData.name,
      type: !categoryData.type,
      sector_id: !categoryData.sector_id,
    };
    if (missing.name || missing.type || missing.sector_id) {
      const newErrors = {};
      if (missing.name) newErrors.name = ["Name is required"];
      if (missing.type) newErrors.type = ["Category type is required"];
      if (missing.sector_id) newErrors.sector_id = ["Sector is required"];
      setErrors(newErrors);
      setLoading(false);
      notification("error", "Missing required fields", "Please complete the form.");
      return;
    }
    const payload = {
      name: categoryData.name,
      type: categoryData.type,
      sector_id: categoryData.sector_id,
    };

    try {
      const data = categoryData.id
        ? await updateCategory({ id: categoryData.id, data: payload }).unwrap()
        : await createCategory({ data: payload }).unwrap();
      notification("success", data?.message, data?.description);
      
      if (onSuccess) {
        onSuccess();
      }

      if (createMore) {
        // Reset form for creating more categories
        setCategoryData(_initialCategoryData);
      } else {
        // Close sidebar
        closeSidebar();
      }
    } catch (err) {
      if (err?.data?.errors) {
        setErrors(err.data.errors);
      }
      notification(
        "error",
        err?.data?.message || "An error occurred",
        err?.data?.description || "Please try again later."
      );
  } finally {
      setLoading(false);
    }
  };

  // Expose imperative methods for sticky footer actions
  useImperativeHandle(ref, () => ({
    save: () => {
      // Programmatic submit that keeps the sidebar open
      categorySubmit({ preventDefault: () => {} }, true);
    },
    saveAndExit: () => {
      // Programmatic submit that closes the sidebar
      categorySubmit({ preventDefault: () => {} }, false);
    },
  }));

  if (singleCategoryFetching) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="category-form-sidebar ">
      <Form id={formId} onSubmit={(e) => categorySubmit(e, true)}>
        {/* Row: Name / Type */}
        <Row>
          <Col xs={12} md={12}>
            <InputGroup className={errors.name ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="category_name">Category Name *</InputGroup.Text>
              <Form.Control
                placeholder="Enter category name"
                aria-label="Category Name"
                aria-describedby="category_name"
                type="text"
                name="name"
                value={categoryData.name}
                onChange={handleInputChange}
                required
              />
            </InputGroup>
            {errors.name && (<p className="error-message">{errors.name[0]}</p>)}
          </Col>
          <Col xs={12} md={12}>
            <InputGroup className={errors.type ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="category_type">Category Type *</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  value={[
                    { value: "income", label: "Income" },
                    { value: "expense", label: "Expense" },
                  ].find((opt) => opt.value === (categoryData.type || "income")) || null}
                  onChange={(opt) => setCategoryData({ ...categoryData, type: opt?.value || "" })}
                  options={[
                    { value: "income", label: "Income" },
                    { value: "expense", label: "Expense" },
                  ]}
                />
              </div>
            </InputGroup>
            {errors.type && (<p className="error-message">{errors.type[0]}</p>)}
          </Col>
        </Row>

        {/* Row: Sector */}
        <Row>
          <Col xs={12} md={12}>
            <InputGroup className={errors.sector_id ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="category_sector">Sector *</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable
                  value={
                    sectors.length > 0
                      ? sectors
                          .map((sector) => ({ value: String(sector.id), label: sector.label }))
                          .find((opt) => opt.value === (categoryData.sector_id || "")) || null
                      : null
                  }
                  onChange={(opt) => setCategoryData({ ...categoryData, sector_id: opt?.value || "" })}
                  options={sectors.map((sector) => ({ value: String(sector.id), label: sector.label }))}
                  placeholder="Select Sector"
                />
              </div>
            </InputGroup>
            {errors.sector_id && (<p className="error-message">{errors.sector_id[0]}</p>)}
          </Col>
        </Row>

        {/* Submit Buttons (hidden when using sticky footer) */}
        {!hideInternalFooter && (
          <Row className="mt-4 pt-3 border-top">
            <Col xs={12}>
              <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 justify-content-end">
                {categoryId ? (
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-100 w-sm-auto px-4"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      "Update Category"
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline-primary"
                      onClick={(e) => categorySubmit(e, true)}
                      disabled={loading}
                      size="lg"
                      className="w-100 w-sm-auto px-4 order-2 order-sm-1"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        "Create & Add More"
                      )}
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="w-100 w-sm-auto px-4 order-1 order-sm-2"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        "Create & Close"
                      )}
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
});
