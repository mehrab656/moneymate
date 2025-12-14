import React, { useState, useEffect, forwardRef, useImperativeHandle, useContext } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { notification } from '../../../components/ToastNotification.jsx';
import axiosClient from '../../../axios-client.js';
import { 
  useCreateBudgetMutation, 
  useUpdateBudgetMutation, 
  useGetSingleBudgetDataQuery 
} from '../../../api/slices/budgetSlice.js';
import { useSidebarActions } from '../../../hooks/useSidebarActions.js';
import { SettingsContext } from '../../../contexts/SettingsContext.jsx';
import { useTheme } from '@mui/material/styles';
import { createSelectStyles, createInputGroupTextStyle } from '../../../styles/formThemeStyles.js';

export default forwardRef(function BudgetFormSidebar({ 
  budgetId = null, 
  onSuccess = () => {},
  formId: formIdProp = null,
  hideInternalFooter = false,
}, ref) {
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
  const formId = formIdProp || "budget-form-sidebar-form";
  const { themeMode } = useContext(SettingsContext);
  const isDark = themeMode === "dark";
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const inputStyle = {
    backgroundColor: isDark ? "#1c1f24" : "#fff",
    color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    borderColor: isDark ? "#3a4048" : "#c5ccd6",
    fontSize: "0.875rem",
    minHeight: 36,
    height: 36,
  };
  const selectStyles = createSelectStyles(theme, "0.875rem");

  const DateInput = React.forwardRef(({ value, onClick, placeholder, isInvalid }, ref) => (
    <Form.Control
      size="sm"
      value={value || ""}
      onClick={onClick}
      placeholder={placeholder}
      readOnly
      isInvalid={!!isInvalid}
      style={inputStyle}
      ref={ref}
    />
  ));

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
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: null }));
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

  const handleSubmit = async (e, stay = true) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    const budgetData = {
      ...budget,
      categories: selectedCategories.map((opt) => opt.value),
    };

    try {
      let result;
      
      if (budgetId) {
        // RTK slice expects { id, formData }
        result = await updateBudget({ id: budgetId, formData: budgetData }).unwrap();
      } else {
        // RTK slice expects { formData }
        result = await createBudget({ formData: budgetData }).unwrap();
      }
      
      notification('success', result?.message || 'Budget saved successfully', result?.description);
      onSuccess();
      if (!stay) {
        closeSidebar();
      } else {
        setBudget({
          budget_name: '',
          amount: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
        });
        setSelectedCategories([]);
      }
      
    } catch (error) {
      const data = error?.data || {};
      const serverErrors = data?.errors;
      const knownFields = ['budget_name','amount','start_date','end_date','categories'];
      const hasKnownFieldErrors =
        serverErrors &&
        typeof serverErrors === 'object' &&
        Object.keys(serverErrors || {}).some((k) => knownFields.includes(k));
      if (hasKnownFieldErrors) {
        setErrors(serverErrors);
      } else {
        notification('error', data?.message || 'An error occurred', data?.description);
      }
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    save: () => {
      handleSubmit({ preventDefault: () => {} }, true);
    },
    saveAndExit: () => {
      handleSubmit({ preventDefault: () => {} }, false);
    },
  }));

  const isFormLoading = loading || isCreating || isUpdating || isFetchingBudget;
  const errorText = (field) => {
    const v = errors?.[field];
    if (!v) return null;
    return Array.isArray(v) ? v[0] : v;
  };

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
      <Form id={formId} onSubmit={(e) => handleSubmit(e, true)}>
        <Row>
          <Col xs={12}>
            <InputGroup className={errors.budget_name ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="budget_name_label" style={inputGroupTextStyle}>Budget Name *</InputGroup.Text>
              <Form.Control
                type="text"
                aria-label="Budget Name"
                aria-describedby="budget_name_label"
                placeholder="Enter budget name"
                value={budget.budget_name}
                onChange={(e) => handleInputChange('budget_name', e.target.value)}
                isInvalid={!!errors.budget_name}
                style={inputStyle}
              />
            </InputGroup>
            {errorText('budget_name') && <p className="error-message">{errorText('budget_name')}</p>}
          </Col>
          
          <Col xs={12}>
            <InputGroup className={errors.amount ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="budget_amount_label" style={inputGroupTextStyle}>Budget Amount *</InputGroup.Text>
              <Form.Control
                type="number"
                aria-label="Budget Amount"
                aria-describedby="budget_amount_label"
                step="0.01"
                min="0"
                placeholder="Enter budget amount"
                value={budget.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                isInvalid={!!errors.amount}
                style={inputStyle}
              />
            </InputGroup>
            {errorText('amount') && <p className="error-message">{errorText('amount')}</p>}
          </Col>
          
          <Col xs={12}>
            <InputGroup className={(errors.categories ? "mb-1" : "mb-3") + " flex-nowrap"} size="sm">
              <InputGroup.Text id="expense_categories_label" style={inputGroupTextStyle}>Budget Expense Categories *</InputGroup.Text>
              <div className="flex-grow-1 d-flex" aria-describedby="expense_categories_label" style={{ minWidth: 0 }}>
                <Select
                  className="react-select-container w-100"
                  classNamePrefix="select"
                  styles={selectStyles}
                  isMulti
                  isSearchable={false}
                  value={selectedCategories}
                  options={expenseCategories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  }))}
                  onChange={handleCategoryChange}
                  placeholder="Categories"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  closeMenuOnSelect={false}
                  menuPlacement="auto"
                />
              </div>
            </InputGroup>
            {errorText('categories') && (<p className="error-message">{errorText('categories')}</p>)}
          </Col>
          
          <Col xs={12}>
            <InputGroup className={(errors.start_date ? "mb-1" : "mb-3") + " flex-nowrap"} size="sm">
              <InputGroup.Text id="start_date_label" style={inputGroupTextStyle}>Start Date *</InputGroup.Text>
              <div className="flex-grow-1 d-flex" aria-describedby="start_date_label" style={{ minWidth: 0 }}>
                <DatePicker
                  selected={budget.start_date ? new Date(budget.start_date) : null}
                  onChange={(date) => handleDateChange('start_date', date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Start Date"
                  customInput={<DateInput placeholder="Start Date" isInvalid={errors.start_date} />}
                  wrapperClassName="w-100"
                  popperClassName="budget-datepicker"
                  popperPlacement="bottom-start"
                />
              </div>
            </InputGroup>
            {errorText('start_date') && (<p className="error-message">{errorText('start_date')}</p>)}
          </Col>
          
          <Col xs={12}>
            <InputGroup className={(errors.end_date ? "mb-1" : "mb-3") + " flex-nowrap"} size="sm">
              <InputGroup.Text id="end_date_label" style={inputGroupTextStyle}>End Date</InputGroup.Text>
              <div className="flex-grow-1 d-flex" aria-describedby="end_date_label" style={{ minWidth: 0 }}>
                <DatePicker
                  selected={budget.end_date ? new Date(budget.end_date) : null}
                  onChange={(date) => handleDateChange('end_date', date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="End Date"
                  customInput={<DateInput placeholder="End Date" isInvalid={errors.end_date} />}
                  wrapperClassName="w-100"
                  minDate={budget.start_date ? new Date(budget.start_date) : null}
                  popperClassName="budget-datepicker"
                  popperPlacement="bottom-start"
                />
              </div>
            </InputGroup>
            {errorText('end_date') && (<p className="error-message">{errorText('end_date')}</p>)}
          </Col>
        </Row>
        
        {!hideInternalFooter && (
          <div className="d-flex gap-2 mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={closeSidebar}
                  disabled={isFormLoading}
                  className="flex-fill"
                >
                  Cancel
                </Button>
                {budgetId ? (
                  <Button 
                    type="button"
                    variant="warning" 
                    disabled={isFormLoading}
                    className="flex-fill"
                    onClick={(e) => handleSubmit(e, false)}
                  >
                    {isFormLoading && (
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                    Update
                  </Button>
                ) : (
                  <>
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
                      Save
                    </Button>
                    <Button 
                      type="button"
                      variant="secondary" 
                      disabled={isFormLoading}
                      className="flex-fill"
                      onClick={(e) => handleSubmit(e, false)}
                    >
                      Save and Exit
                    </Button>
                  </>
                )}
              </div>
            )}
          </Form>
        </div>
      );
    });
