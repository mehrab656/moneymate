import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { notification } from '../../components/ToastNotification.jsx';
import axiosClient from '../../axios-client';
import { 
  useCreateBudgetMutation, 
  useUpdateBudgetMutation, 
  useGetSingleBudgetDataQuery 
} from '../../api/slices/budgetSlice';
import { useSidebarActions } from '../../hooks/useSidebarActions';

const BudgetFormSidebar = ({ 
  budgetId = null, 
  onSuccess = () => {} 
}) => {
  const [budget, setBudget] = useState({
    budget_name: '',
    amount: '',
    start_date: '',
    end_date: '',
  });
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { closeSidebar } = useSidebarActions();

  // RTK Query mutations
  const [createBudget, { isLoading: isCreating }] = useCreateBudgetMutation();
  const [updateBudget, { isLoading: isUpdating }] = useUpdateBudgetMutation();
  
  // Query for editing existing budget
  const { 
    data: budgetData, 
    isLoading: isFetchingBudget 
  } = useGetSingleBudgetDataQuery(
    { id: budgetId }, 
    { skip: !budgetId }
  );

  // Load expense categories
  const getExpenseCategories = () => {
    axiosClient
      .get('/expense-categories')
      .then(({ data }) => {
        setExpenseCategories(data.categories);
      })
      .catch((error) => {
        console.error('Error loading expense categories:', error);
      });
  };

  // Initialize form when component mounts
  useEffect(() => {
    getExpenseCategories();
    
    // Reset form for new budget
    if (!budgetId) {
      setBudget({
        budget_name: '',
        amount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      setSelectedCategories([]);
      setErrors({});
    }
  }, [budgetId]);

  // Load budget data for editing
  useEffect(() => {
    if (budgetData && budgetId) {
      setBudget({
        budget_name: budgetData.budget_name || '',
        amount: budgetData.amount || '',
        start_date: budgetData.start_date || '',
        end_date: budgetData.end_date || '',
      });
      
      // Set selected categories if available
      if (budgetData.categories) {
        setSelectedCategories(
          budgetData.categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))
        );
      }
    }
  }, [budgetData, budgetId]);

  const handleInputChange = (field, value) => {
    setBudget(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions || []);
    
    // Clear categories error
    if (errors.categories) {
      setErrors(prev => ({
        ...prev,
        categories: null
      }));
    }
  };

  const handleDateChange = (field, date) => {
    const dateValue = date ? date.toISOString().split('T')[0] : '';
    handleInputChange(field, dateValue);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!budget.budget_name.trim()) {
      newErrors.budget_name = 'Budget name is required';
    }
    
    if (!budget.amount || parseFloat(budget.amount) <= 0) {
      newErrors.amount = 'Valid budget amount is required';
    }
    
    if (!budget.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (selectedCategories.length === 0) {
      newErrors.categories = 'At least one category must be selected';
    }
    
    if (budget.end_date && budget.start_date && new Date(budget.end_date) <= new Date(budget.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    const budgetData = {
      ...budget,
      categories: selectedCategories.map(category => category.value),
    };

    try {
      let result;
      
      if (budgetId) {
        result = await updateBudget({ id: budgetId, ...budgetData }).unwrap();
      } else {
        result = await createBudget(budgetData).unwrap();
      }
      
      notification('success', result?.message || 'Budget saved successfully', result?.description);
      onSuccess();
      closeSidebar();
      
    } catch (error) {
      console.error('Budget submission error:', error);
      
      if (error.data?.errors) {
        setErrors(error.data.errors);
      } else {
        notification('error', error.data?.message || 'An error occurred', error.data?.description);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormLoading = loading || isCreating || isUpdating || isFetchingBudget;

  if (isFetchingBudget) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-form-sidebar p-3 p-md-4">
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs={12}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label fw-semibold">
                Budget Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                size="lg"
                placeholder="Enter budget name"
                value={budget.budget_name}
                onChange={(e) => handleInputChange('budget_name', e.target.value)}
                isInvalid={!!errors.budget_name}
                className="form-control-lg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.budget_name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          
          <Col xs={12}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label fw-semibold">
                Budget Amount <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                size="lg"
                step="0.01"
                min="0"
                    placeholder="Enter budget amount"
                    value={budget.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    isInvalid={!!errors.amount}
                    className="form-control-lg"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.amount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label fw-semibold">
                    Expense Categories <span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    isMulti
                    value={selectedCategories}
                    options={expenseCategories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                    onChange={handleCategoryChange}
                    placeholder="Select expense categories"
                    className={`react-select-container ${errors.categories ? 'is-invalid' : ''}`}
                    classNamePrefix="react-select"
                    isSearchable
                    closeMenuOnSelect={false}
                  />
                  {errors.categories && (
                    <div className="invalid-feedback d-block">
                      {errors.categories}
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label fw-semibold">
                    Start Date <span className="text-danger">*</span>
                  </Form.Label>
                  <DatePicker
                    selected={budget.start_date ? new Date(budget.start_date) : null}
                    onChange={(date) => handleDateChange('start_date', date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    className={`form-control form-control-lg ${errors.start_date ? 'is-invalid' : ''}`}
                    wrapperClassName="w-100"
                  />
                  {errors.start_date && (
                    <div className="invalid-feedback d-block">
                      {errors.start_date}
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label fw-semibold">
                    End Date
                  </Form.Label>
                  <DatePicker
                    selected={budget.end_date ? new Date(budget.end_date) : null}
                    onChange={(date) => handleDateChange('end_date', date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date (optional)"
                    className={`form-control form-control-lg ${errors.end_date ? 'is-invalid' : ''}`}
                    wrapperClassName="w-100"
                    minDate={budget.start_date ? new Date(budget.start_date) : null}
                  />
                  {errors.end_date && (
                    <div className="invalid-feedback d-block">
                      {errors.end_date}
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex gap-2 mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={closeSidebar}
                disabled={isFormLoading}
                className="flex-fill"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="primary" 
                disabled={isFormLoading}
                className="flex-fill"
              >
                {isFormLoading && (
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
                {budgetId ? 'Update Budget' : 'Create Budget'}
              </Button>
            </div>
          </Form>
        </div>
      );
    };

    export default BudgetFormSidebar;