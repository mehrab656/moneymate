import React, {memo, useEffect, useState} from "react";
import {Col, Tab, Row, Button, Nav, Modal, InputGroup, Form} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {useGetSectorListDataQuery} from "../../api/slices/sectorSlice.js"
import {useGetCategoryListDataQuery} from "../../api/slices/categorySlice.js"
import {faCheckSquare, faFilter, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useDispatch} from "react-redux";

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
              <input
                  className='custom-form-control'
                  placeholder='search by keywards'
                  value={searchSectors}
                  onChange={(ev) =>
                      setSearchSector(ev.target.value)
                  }
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
                                             }}/>
                        <Form.Control
                            type="text"
                            value={sector.label}
                            disabled={true}
                            aria-describedby="basic-addon3"
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
          <input
              className='custom-form-control'
              placeholder='search by keywards'
              value={searchCategories}
              onChange={(ev) =>
                  setSearchCategories(ev.target.value)
              }
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
                                         }}/>
                    <Form.Control
                        type="text"
                        value={category.label}
                        disabled={true}
                        aria-describedby="basic-addon3"
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
          <select
              className="form-control"
              name="expense-filter-order-by"
              value={queryParams.orderBy}
              onChange={(event) => {
                const value = event.target.value || '';
                setQueryParams({...queryParams, orderBy: value});
              }}>
            <option defaultValue>Filter By Order Column</option>
            <option value={'id'}>{'Id'}</option>
            <option value={'date'}>{'Date'}</option>
            <option value={'amount'}>{'Amount'}</option>
            <option value={'refundable_amount'}>{'Refundable Amount'}</option>
            <option value={'refunded_amount'}>{'Refunded Amount'}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="custom-form-label" htmlFor="expense-filter-order">Order</label>
          <select
              className="form-control"
              value={queryParams.order}
              id="order"
              name="order"
              onChange={(event) => {
                const value = event.target.value || '';
                setQueryParams({...queryParams, order: value});
              }}>
            <option defaultValue>Filter By Order</option>
            <option value={'DESC'}>{'DESCENDING'}</option>
            <option value={'ASC'}>{'ASCENDING'}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="custom-form-label" htmlFor="expense-filter-limit">
            Limit
          </label>
          <select
              className="form-control"
              name="expense-filter-limit"
              value={queryParams.limit}
              onChange={(event) => {
                const value = event.target.value || '';
                setQueryParams({...queryParams, limit: value});
              }}>
            <option defaultValue>Filter By Limit</option>
            <option value={'10'}>{'10'}</option>
            <option value={'20'}>{'20'}</option>
            <option value={'50'}>{'50'}</option>
            <option value={'100'}>{'100'}</option>
            <option value={'500'}>{'500'}</option>
            <option value={'1000'}>{'1000'}</option>
          </select>
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
            <Button variant="danger" onClick={resetFilter}>
              Reset
            </Button>
            <Button variant="info" onClick={submitFilter}>Filter</Button>
          </Modal.Footer>
        </Modal>
      </>
  );
}

export default memo(ExpenseFilter)