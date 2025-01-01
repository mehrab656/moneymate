import React, {memo, useEffect, useState} from "react";
import {Col, Tab, Row, Button, Nav, Modal, InputGroup, Form} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {useGetSectorListDataQuery} from "../../api/slices/sectorSlice.js"
import {useGetCategoryListDataQuery} from "../../api/slices/categorySlice.js"
import {genRand} from "../HelperFunctions.js";

const navItems = [
    {key: 'filter-report-by-sector', name: 'Sector'},
    {key: 'filter-report-by-categories', name: 'Categories'},
    {key: 'filter-report-by-others', name: 'Others'},
]


const ExpenseFilter = ({
                           params,
                           setParam,
                           handleFilterSubmit,
    resetFilterParameter
                       }) => {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [currentTab, setCurrentTab] = useState(navItems[0].key)
    const [sectors, setSectors] = useState([]);
    const [searchSectors, setSearchSector] = useState("");
    const [searchCategories, setSearchCategories] = useState("");
    const [categories, setCategories] =useState([])

    const {data: getSectorListData} = useGetSectorListDataQuery();
    const {data: getCategoryListData} = useGetCategoryListDataQuery({categoryType: 'expense'});
    const toggleFilterModal = () => {
        setShowFilterModal(!showFilterModal);
    }

    useEffect(() => {
        if (getSectorListData?.data) {
            setSectors(getSectorListData.data);
        }
        if (getCategoryListData?.data) {
            setCategories(getCategoryListData.data);
        }
    }, [getSectorListData,getCategoryListData]);


    const filteredSectors = sectors.filter((sector) =>
        sector.label.toLowerCase().includes(searchSectors.toLowerCase())
    );

    const filteredCategories = categories.filter((category) =>
        category.label.toLowerCase().includes(searchCategories.toLowerCase())
    );
    const handelSectorIds = (e, slug) => {
        let sectorLists = params.sectorIDS;
        if (e.target.checked) {
            sectorLists = sectorLists.concat(slug)
        } else {
            const index = sectorLists.indexOf(slug)
            sectorLists.splice(index, 1);
        }
        setParam({...params, sectorIDS: sectorLists})
    }
    const handelCategoryIDS = (e, slug) => {
        let categoryList = params.categoryIDS;
        if (e.target.checked) {
            const isValueExist = categoryList.includes(slug);
            if (!isValueExist){
                categoryList = categoryList.concat(slug)
                setParam({...params, categoryIDS: categoryList})

            }
        } else {
            const index = categoryList.indexOf(slug)
            console.log(index);
            categoryList.splice(index, 1);
            setParam({...params, categoryIDS: categoryList})

        }
    }

    const showCurrentPan = (currentTab) => {
        if (currentTab === 'filter-report-by-sector') {
            return (<Tab.Pane eventKey={'filter-report-by-sector'}>
                <label className="custom-form-label" htmlFor="filter-by-sector">
                    Filter By Sectors
                </label>
                <div className='form-group'>
                    <input
                        className='custom-form-control'
                        placeholder='search by keywards'
                        value={searchSectors}
                        onChange={(ev) =>
                            setSearchSector(ev.target.value)
                        }
                    />
                </div>
                <div className={"report-filter-list"}>
                    {filteredSectors.length > 0 ?
                        filteredSectors.map((sector) => (
                            <InputGroup className="mb-3" size={"sm"}>
                                <InputGroup.Checkbox aria-label={`Checkbox for ${sector.label}`}
                                                     id={sector.value}
                                                     onChange={e => {
                                                         handelSectorIds(e, sector.value)
                                                     }}/>
                                <Form.Control
                                    type="text"
                                    value={sector.label}
                                    disabled={true}
                                    aria-describedby="basic-addon3"
                                />
                            </InputGroup>
                        )) :
                        'Nothing found'}</div>
            </Tab.Pane>)
        }
        if (currentTab === 'filter-report-by-categories') {
            return (<Tab.Pane eventKey={'filter-report-by-categories'}>
                <label className="custom-form-label" htmlFor="filter-by-sector">
                    Filter By Categories
                </label>
                <div className='form-group'>
                    <input
                        className='custom-form-control'
                        placeholder='search by keywards'
                        value={searchCategories}
                        onChange={(ev) =>
                            setSearchCategories(ev.target.value)
                        }
                    />
                </div>
                <div className={"report-filter-list"}>
                    {filteredCategories.length > 0 ?
                        filteredCategories.map((category) => (
                            <InputGroup className="mb-3" size={"sm"}>
                                <InputGroup.Checkbox aria-label={`Checkbox for ${category.label}`}
                                                     id={category.value}
                                                     onChange={e => {
                                                         handelCategoryIDS(e, category.value)
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
                        value={params.orderBy}
                        onChange={(event) => {
                            const value = event.target.value || '';
                            setParam({...params, orderBy: value});
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
                        value={params.order}
                        id="order"
                        name="order"
                        onChange={(event) => {
                            const value = event.target.value || '';
                            setParam({...params, order: value});
                        }}>
                        <option defaultValue>Filter By Order</option>
                        <option value={'DESC'}>{'DESCENDING'}</option>
                        <option value={'ASC'}>{'ASCENDING'}</option>
                    </select>
                </div>

            </Tab.Pane>)
        }
    }

    return (
        <>
            <button className={'btn btn-success btn-sm mr-2'} onClick={toggleFilterModal}>Filter</button>
            <Modal
                show={showFilterModal}
                onHide={toggleFilterModal}
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
                    <Button variant="danger" onClick={resetFilterParameter}>
                        Reset
                    </Button>
                    <Button variant="info" onClick={handleFilterSubmit}>Filter</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default memo(ExpenseFilter)