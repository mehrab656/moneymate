import React, {memo, useEffect, useState} from "react";
import {Col, Tab, Row, Button, Nav, Modal, InputGroup, Form} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {useGetSectorListDataQuery} from "../../../api/slices/sectorSlice.js"
import { faRefresh} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const navItems = [
  {key: 'filter-report-by-sector', name: 'Sector'},
  {key: 'filter-report-by-reference', name: 'References'},
  {key: 'filter-report-by-income-types', name: 'Income Type'},
  {key: 'filter-report-by-date', name: 'Date'},
  {key: 'filter-report-by-others', name: 'Others'},
]
const incomeReferences = [
  {value: 'air-bnb', label: 'Airbnb'},
  {value: 'booking', label: 'Booking.com'},
  {value: 'vrbo', label: 'VRBO'},
  {value: 'expedia', label: 'Expedia'},
  {value: 'cash', label: 'Cash'},
  {value: 'cheque', label: 'Cheque'},
  {value: 'bankTransfer', label: 'Bank Transfer'},
];
const incomeTypes = [
  {value: 'reservation', label: 'Reservation'},
  {value: 'rent', label: 'Rent'},
  {value: 'electricity_bill', label: 'Electricity Bill'},
  {value: 'internet_bill', label: 'Internet Bill'},
  {value: 'service', label: 'Service Provide'},
  {value: 'others', label: 'Others'},
]
const IncomeFilter = ({showModal,closeModal,resetFilter,submitFilter,queryParams, setQueryParams}) => {
  const [currentTab, setCurrentTab] = useState(navItems[0].key)
  const [sectors, setSectors] = useState([]);
  const [reloadSectors,setReloadSectors] = useState(false);
  const [searchSectors, setSearchSector] = useState("");
  const [searchReference, setSearchReference] = useState("");
  const [searchIncomeType, setSearchIncomeType] = useState("");

  //fetching sectors.
  const {
    data: getSectorListData,
    isFetching: isFetchingSector,
    isError: hasSectorFetchingError,
  } = useGetSectorListDataQuery({skip:!reloadSectors});

  useEffect(() => {
    if (getSectorListData?.data) {
      setSectors(getSectorListData.data);
      setReloadSectors(false);
    }

  }, [getSectorListData?.data]);

  const filteredSectors = sectors.filter((sector) =>
      sector.label.toLowerCase().includes(searchSectors.toLowerCase())
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
  const handleReference = (e, ref) => {
    let reference = queryParams.reference;
    if (e.target.checked) {
      reference = reference.concat(ref.value)
    } else {
      reference = reference.filter(reference=> reference !== ref.value)
    }
    setQueryParams({...queryParams, reference: reference})
  }
  const handleIncomeType = (e, type) => {
    let incomeType = queryParams.income_type;
    if (e.target.checked) {
      incomeType = incomeType.concat(type.value)
    } else {
      incomeType = incomeType.filter(inc_type=> inc_type !== type.value)
    }
    setQueryParams({...queryParams, income_type: incomeType})
  }
  const reFetchSector = ()=>{
    setReloadSectors(true);
  }

  console.log(queryParams)
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
    if (currentTab === 'filter-report-by-reference') {
      return (
          <Tab.Pane eventKey={'filter-report-by-reference'}>
            <label className="custom-form-label" htmlFor="filter-by-reference">
              Filter By Reference
              <FontAwesomeIcon icon={faRefresh}
                               className={"reload-icon float-end"}
                               spin={false}
                               title={"reload references"}
              />

            </label>
            <div className='form-group mb-1'>
              <input
                  className='custom-form-control'
                  placeholder='search by keywards'
                  value={searchReference}
                  onChange={(ev) =>
                      setSearchReference(ev.target.value)
                  }
              />
            </div>
            <span className={'results'}>{`Found ${incomeReferences.length} Results`}</span>

            <div className={"report-filter-list"}>
              {incomeReferences.length > 0 ?
                  incomeReferences.map((ref, index) => (
                      <InputGroup className="mb-3" size={"sm"} key={`sector-${index}`}>
                        <InputGroup.Checkbox aria-label={`Checkbox for ${ref.label}`}
                                             id={ref.value}
                                             checked={queryParams.reference.includes(ref.value)}
                                             onChange={e => {
                                               handleReference(e, ref)
                                             }}/>
                        <Form.Control
                            type="text"
                            value={ref.label}
                            disabled={true}
                            aria-describedby="basic-addon3"
                        />
                      </InputGroup>
                  )) :
                  'Nothing found'}
            </div>
          </Tab.Pane>)
    }
    if (currentTab === 'filter-report-by-income-types') {
      return (
          <Tab.Pane eventKey={'filter-report-by-income-types'}>
            <label className="custom-form-label" htmlFor="filter-by-income-types">
              Filter By Reference
              <FontAwesomeIcon icon={faRefresh}
                               className={"reload-icon float-end"}
                               spin={false}
                               title={"Reload Income Types"}
              />

            </label>
            <div className='form-group mb-1'>
              <input
                  className='custom-form-control'
                  placeholder='search by keywards'
                  value={searchIncomeType}
                  onChange={(ev) =>
                      setSearchIncomeType(ev.target.value)
                  }
              />
            </div>
            <span className={'results'}>{`Found ${incomeTypes.length} Results`}</span>

            <div className={"report-filter-list"}>
              {incomeTypes.length > 0 ?
                  incomeTypes.map((type, index) => (
                      <InputGroup className="mb-3" size={"sm"} key={`incomeType-${index}`}>
                        <InputGroup.Checkbox aria-label={`Checkbox for ${type.label}`}
                                             id={type.value}
                                             checked={queryParams.income_type.includes(type.value)}
                                             onChange={e => {
                                               handleIncomeType(e, type)
                                             }}/>
                        <Form.Control
                            type="text"
                            value={type.label}
                            disabled={true}
                            aria-describedby="basic-addon3"
                        />
                      </InputGroup>
                  )) :
                  'Nothing found'}
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
    if (currentTab === 'filter-report-by-others') {
      return (<Tab.Pane eventKey={"filter-report-by-others"}>
        <div className="form-group">
          <label className="custom-form-label" htmlFor="income-filter-order-by">
            Order By
          </label>
          <select
              className="form-control"
              name="income-filter-order-by"
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
          <label className="custom-form-label" htmlFor="income-filter-order">Order</label>
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
          <label className="custom-form-label" htmlFor="income-filter-limit">
            Limit
          </label>
          <select
              className="form-control"
              name="income-filter-limit"
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
  }

  return (
      <>
        <Modal
            show={showModal}
            onHide={closeModal}
            backdrop="static"
            keyboard={false}
        >
          <Modal.Header closeButton onClick={resetFilter}>
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

export default memo(IncomeFilter)