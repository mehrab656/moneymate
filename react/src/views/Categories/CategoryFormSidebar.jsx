import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { notification } from "../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../components/GlobalSidebar";
import {
  useCreateCategoryMutation,
  useGetCategorySectorListDataQuery,
  useGetSingleCategoryDataQuery,
} from "../../api/slices/categorySlice.js";

const _initialCategoryData = {
  id: null,
  sector_id: "",
  name: "",
  type: "income",
};

export default function CategoryFormSidebar({ categoryId = null, onSuccess }) {
  const [categoryData, setCategoryData] = useState(_initialCategoryData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState([]);

  const { closeSidebar } = useSidebarActions();
  const [createCategory] = useCreateCategoryMutation();

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
    if (getSingleCategoryData?.data) {
      const categoryData = getSingleCategoryData.data;
      setCategoryData({
        id: categoryData.id,
        sector_id: categoryData.sector_id || "",
        name: categoryData.name || "",
        type: categoryData.type || "income",
      });
    }
  }, [getSingleCategoryData]);

  // Load sectors data
  useEffect(() => {
    if (getCategorySectorListData?.data) {
      setSectors(getCategorySectorListData.data);
    }
  }, [getCategorySectorListData]);

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

    const formData = new FormData();
    formData.append("name", categoryData.name);
    formData.append("type", categoryData.type);
    formData.append("sector_id", categoryData.sector_id);

    const url = categoryData.id ? `/category/${categoryData.id}` : "/category/add";

    try {
      const data = await createCategory({ url: url, formData }).unwrap();
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
    <div className="category-form-sidebar p-3 p-md-4">
      <Form onSubmit={(e) => categorySubmit(e, false)}>
        {/* Category Name */}
        <Row className="mb-3">
          <Col xs={12}>
            <Form.Group className="form-group">
              <Form.Label className="fw-semibold mb-2">Category Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={categoryData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                size="lg"
                className="form-control-lg"
                required
              />
              {errors.name && (
                <div className="text-danger small mt-1">{errors.name[0]}</div>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Category Type */}
        <Row className="mb-3">
          <Col xs={12}>
            <Form.Group className="form-group">
              <Form.Label className="fw-semibold mb-2">Category Type *</Form.Label>
              <Form.Select
                name="type"
                value={categoryData.type}
                onChange={handleInputChange}
                size="lg"
                className="form-select-lg"
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Form.Select>
              {errors.type && (
                <div className="text-danger small mt-1">{errors.type[0]}</div>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Sector */}
        <Row className="mb-4">
          <Col xs={12}>
            <Form.Group className="form-group">
              <Form.Label className="fw-semibold mb-2">Sector *</Form.Label>
              <Form.Select
                name="sector_id"
                value={categoryData.sector_id}
                onChange={handleInputChange}
                size="lg"
                className="form-select-lg"
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
                <div className="text-danger small mt-1">{errors.sector_id[0]}</div>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Submit Buttons */}
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
      </Form>
    </div>
  );
}