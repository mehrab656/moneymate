import React, {memo, useEffect, useState, useContext} from "react";
import {Col, Tab, Row, Button, Nav, Modal, InputGroup, Form} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {useGetSectorListDataQuery} from "../../../api/slices/sectorSlice.js"
import {useGetCategoryListDataQuery} from "../../../api/slices/categorySlice.js"
import {faCheckSquare, faFilter, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import Select from "react-select";

const navItems = [
  {key: 'filter-report-by-sector', name: 'Sector'},
  {key: 'filter-report-by-categories', name: 'Categories'},
  {key: 'filter-report-by-others', name: 'Others'},
  {key: 'filter-report-by-date', name: 'Date'},
]

const ExpenseFilter = ({showModal,closeModal,resetFilter,submitFilter,queryParams, setQueryParams
                       }) => {
  const [currentTab, setCurrentTab] = useState(navItems[0].key)
  const [sectors, setSectors] = useState([]);
  const [reloadCategory,setReloadCategory] = useState(false);
  const [reloadSectors,setReloadSectors] = useState(false);
  const [searchSectors, setSearchSector] = useState("");
  const [searchCategories, setSearchCategories] = useState("");
  const [categories, setCategories] =useState([]);
  const { themeMode } = useContext(SettingsContext);
  const isDark = themeMode === "dark";
  const inputFontSize = "0.875rem";
  const inputStyle = {
    backgroundColor: isDark ? "#1c1f24" : "#fff",
    color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    borderColor: isDark ? "#3a4048" : "#c5ccd6",
    fontSize: inputFontSize,
    minHeight: 36,
  };
  const selectStyles = {
    container: (base) => ({
      ...base,
      width: "100%",
      minWidth: 0,
    }),
    control: (base, state) => ({
      ...base,
      fontSize: inputFontSize,
      minHeight: 36,
      backgroundColor: isDark ? "#1c1f24" : "#fff",
      borderColor: isDark
        ? state.isFocused ? "#4a515b" : "#3a4048"
        : state.isFocused ? "#7aa2d2" : "#c5ccd6",
      boxShadow: "none",
      ":hover": {
        borderColor: isDark ? "#4a515b" : "#7aa2d2",
      },
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    }),
    input: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
    }),
    menu: (base) => ({
      ...base,
      fontSize: inputFontSize,
      backgroundColor: isDark ? "#23262b" : "#fff",
    }),
    menuList: (base) => ({
      ...base,
      backgroundColor: isDark ? "#23262b" : "#fff",
      paddingTop: 0,
      paddingBottom: 0,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: inputFontSize,
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
      backgroundColor: isDark
        ? state.isSelected
          ? "#0C1A28"
          : state.isFocused
            ? "#2d3238"
            : "#23262b"
        : state.isSelected
          ? "#e7f0fb"
          : state.isFocused
            ? "#f2f2f2"
            : "#fff",
    }),
  };
  const checkboxStyle = {
    backgroundColor: isDark ? "#1c1f24" : undefined,
    borderColor: isDark ? "#3a4048" : undefined,
  };

  //fetching sectors and categories.
  const {
    data: getSectorListData,
    isFetching: isFetchingSector,
    isError: hasSectorFetchingError,
  } = useGetSectorListDataQuery({skip:!reloadSectors});

  const {
    data: getCategoryListData,
    isFetching: isFetchingCategory,
    isError: hasCategoryFetchingError} = useGetCategoryListDataQuery({categoryType: 'expense'},{skip:!reloadCategory});


  useEffect(() => {
    if (getSectorListData?.data) {
      setSectors(getSectorListData.data);
      setReloadSectors(false);
    }
    if (getCategoryListData?.data) {
      setCategories(getCategoryListData.data);
      setReloadCategory(false);
    }
  }, [getSectorListData?.data,getCategoryListData?.data]);


  const filteredSectors = sectors.filter((sector) =>
      sector.label.toLowerCase().includes(searchSectors.toLowerCase())
  );

  const filteredCategories = categories.filter((category) =>
      category.label.toLowerCase().includes(searchCategories.toLowerCase())
  );
  const handelSectorIds = (e, sector) => {
    let sectorIDS = queryParams.sectorIDS;
    let sectorNames = queryParams.sectorNames;
    if (e.target.checked) {
      sectorIDS = sectorIDS.concat(sector.value)
      sectorNames = sectorNames.concat(sector.label)
    } else {
      sectorIDS = sectorIDS.filter(sectorID=> sectorID !== sector.value)
      sectorNames = sectorNames.filter(sectorName=> sectorName !== sector.label)
    }
    setQueryParams({...queryParams, sectorIDS: sectorIDS,sectorNames: sectorNames})
  }

  const handelCategoryIDS = (e, category) => {
    let categoryID = queryParams.categoryIDS;
    let categoryNames = queryParams.categoryNames;
    if (e.target.checked) {
      categoryID = categoryID.concat(category.value);
      categoryNames = categoryNames.concat(category.label);
    } else {
      categoryID = categoryID.filter(catID=> catID !== category.value)
      categoryNames = categoryNames.filter(catName=> catName !== category.label)
    }
    setQueryParams({...queryParams, categoryIDS: categoryID,categoryNames: categoryNames})
  }

  const reFetchSector = ()=>{
    setReloadSectors(true);
  }
  const reFetchCategory = ()=>{
    setReloadCategory(true);
  }
  const showCurrentPan = (currentTab) => {
    if (currentTab === 'filter-report-by-sector') {
      return (
          <Tab.Pane eventKey={'filter-report-by-sector'}>
            <label className="custom-form-label" htmlFor="filter-by-sector">
              Filter By Sectors
              <FontAwesomeIcon icon={faRefresh}
                               className={"reload-icon float-end"}
                               onClick={reFetchSector}
                               spin={isFetchingSector}
                               title={"reload sectors"}
              />

            </label>
            <div className='form-group mb-1'>
              <Form.Control
                  size="sm"
                  style={inputStyle}
                  placeholder='search by keywords'
                  value={searchSectors}
                  onChange={(ev) => setSearchSector(ev.target.value)}
              />
            </div>
            <span className={'results'}>{`Found ${filteredSectors.length} Results`}</span>

            <div className={"report-filter-list"}>
              {filteredSectors.length > 0 ?
                  filteredSectors.map((sector, index) => (
                      <InputGroup className="mb-3" size={"sm"} key={`sector-${index}`}>
                        <InputGroup.Checkbox aria-label={`Checkbox for ${sector.label}`}
                                             id={sector.value}
                                             checked={queryParams.sectorIDS.includes(sector.value)}
                                             onChange={e => {
                                               handelSectorIds(e, sector)
                                             }} style={checkboxStyle}/>
                        <Form.Control
                            type="text"
                            value={sector.label}
                            disabled={true}
                            aria-describedby="basic-addon3"
                            style={inputStyle}
                        />
                      </InputGroup>
                  )) :
                  'Nothing found'}
            </div>
          </Tab.Pane>)
    }
    if (currentTab === 'filter-report-by-categories') {
      return (<Tab.Pane eventKey={'filter-report-by-categories'}>
        <label className="custom-form-label" htmlFor="filter-by-sector">
          Filter By Categories
          <FontAwesomeIcon icon={faRefresh} className={"reload-icon float-end"} onClick={reFetchCategory}
          spin={isFetchingCategory} title={"reload category"} />
        </label>
        <div className='form-group mb-1'>
          <Form.Control
              size="sm"
              style={inputStyle}
              placeholder='search by keywords'
              value={searchCategories}
              onChange={(ev) => setSearchCategories(ev.target.value)}
          />
        </div>
        <span className={'results'}>{`Found ${filteredCategories.length} Results`}</span>
        <div className={"report-filter-list"}>
          {filteredCategories.length > 0 ?
              filteredCategories.map((category,index) => (
                  <InputGroup className="mb-3" size={"sm"} key={`category-${index}`}>
                    <InputGroup.Checkbox aria-label={`Checkbox for ${category.label}`}
                                         id={category.value}
                                         checked={queryParams.categoryIDS.includes(category.value)}
                                         onChange={e => {
                                           handelCategoryIDS(e, category)
                                         }} style={checkboxStyle}/>
                    <Form.Control
                        type="text"
                        value={category.label}
                        disabled={true}
                        aria-describedby="basic-addon3"
                        style={inputStyle}
                    />
                  </InputGroup>
              )) :
              'Nothing found'}</div>
      </Tab.Pane>)
    }
    if (currentTab === 'filter-report-by-others') {
      return (<Tab.Pane eventKey={"filter-report-by-others"}>
        <div className="form-group">
          <label className="custom-form-label" htmlFor="expense-filter-order-by">
            Order By
          </label>
          <Select
            classNamePrefix="select"
            name="expense-filter-order-by"
            value={(
              [
                {value:'id',label:'Id'},
                {value:'date',label:'Date'},
                {value:'amount',label:'Amount'},
                {value:'refundable_amount',label:'Refundable Amount'},
                {value:'refunded_amount',label:'Refunded Amount'}
              ].find(opt => opt.value === (queryParams.orderBy || '')) || null
            )}
            onChange={(opt) => {
              const value = opt?.value || '';
              setQueryParams({...queryParams, orderBy: value});
            }}
            options={[
              {value:'id',label:'Id'},
              {value:'date',label:'Date'},
              {value:'amount',label:'Amount'},
              {value:'refundable_amount',label:'Refundable Amount'},
              {value:'refunded_amount',label:'Refunded Amount'},
            ]}
            placeholder={"Filter By Order Column"}
            styles={selectStyles}
            isSearchable={false}
          />
        </div>

        <div className="form-group">
          <label className="custom-form-label" htmlFor="expense-filter-order">Order</label>
          <Select
            classNamePrefix="select"
            id="order"
            name="order"
            value={(
              [
                {value:'DESC',label:'DESCENDING'},
                {value:'ASC',label:'ASCENDING'}
              ].find(opt => opt.value === (queryParams.order || '')) || null
            )}
            onChange={(opt) => {
              const value = opt?.value || '';
              setQueryParams({...queryParams, order: value});
            }}
            options={[
              {value:'DESC',label:'DESCENDING'},
              {value:'ASC',label:'ASCENDING'},
            ]}
            placeholder={"Filter By Order"}
            styles={selectStyles}
            isSearchable={false}
          />
        </div>

        <div className="form-group">
          <label className="custom-form-label" htmlFor="expense-filter-limit">
            Limit
          </label>
          <Select
            classNamePrefix="select"
            name="expense-filter-limit"
            value={(
              [10,20,50,100,500,1000].map(n=>({value:String(n),label:String(n)}))
                .find(opt => opt.value === (String(queryParams.limit || '') || '')) || null
            )}
            onChange={(opt) => {
              const value = opt?.value || '';
              setQueryParams({...queryParams, limit: value});
            }}
            options={[10,20,50,100,500,1000].map(n=>({value:String(n),label:String(n)}))}
            placeholder={"Filter By Limit"}
            styles={selectStyles}
            isSearchable={false}
          />
        </div>
      </Tab.Pane>)
    }
    if (currentTab === 'filter-report-by-date') {
      return (<Tab.Pane eventKey={"filter-report-by-date"}>
         <Form.Group controlId="start_date">
            <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">From</Form.Label>
            <Form.Control size={"sm"} type="date" value={queryParams.start_date} onChange={(e) => {
              setQueryParams({...queryParams, start_date: e.target.value});
            }}/>
          </Form.Group>
        <Form.Group controlId="to_date">
          <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">To</Form.Label>
          <Form.Control size={"sm"} type="date" value={queryParams.end_date} onChange={(e) => {
            setQueryParams({...queryParams, end_date: e.target.value});
          }}/>
        </Form.Group>


      </Tab.Pane>)
    }
  }

  return (
      <>
        {/*<button className={'btn btn-secondary btn-sm mr-2'} onClick={toggleFilterModal}>*/}
        {/*  <FontAwesomeIcon icon={faFilter}/>{' More Filter'}</button>*/}
        <Modal
            show={showModal}
            onHide={closeModal}
            backdrop="static"
            keyboard={false}
            contentClassName="filter-modal-content"
        >
          <Modal.Header closeButton>
            <Modal.Title>Filters</Modal.Title>
          </Modal.Header>
          <Modal.Body className={"filter-modal-body"}>
            <Container>
              <Tab.Container id="left-tabs-example" defaultActiveKey="filter-report-by-sector">

                <Row className={"filter-modal-row"}>
                  <Col md={6} xs={6} className={"filter-column"}>
                    <Nav variant="pills" className="flex-column">
                      {
                        navItems.map(item => {
                          return (<Nav.Item key={item.key}>
                                <Nav.Link eventKey={item.key}
                                          onClick={() => {
                                            setCurrentTab(item.key)
                                          }}>{item.name}</Nav.Link>
                              </Nav.Item>
                          )
                        })
                      }
                    </Nav>
                  </Col>
                  <Col md={6} xs={6} className={"filter-column"}>
                    <Tab.Content>
                      {showCurrentPan(currentTab)}
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>

            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" className="primary-theme-btn" onClick={resetFilter}>
              Reset
            </Button>
            <Button variant="info" className="primary-theme-btn" onClick={submitFilter}>Filter</Button>
          </Modal.Footer>
        </Modal>
      </>
  );
}

export default memo(ExpenseFilter)
