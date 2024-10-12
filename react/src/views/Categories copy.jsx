import React, {useEffect, useState, useContext} from "react";
import axiosClient from "../axios-client.js";
import Swal from "sweetalert2";
import Pagination from "react-bootstrap/Pagination";
import WizCard from "../components/WizCard";
import { Modal} from "react-bootstrap";
import {useStateContext} from "../contexts/ContextProvider";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCoins} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../contexts/SettingsContext";
import ActionButtonHelpers from "../helper/ActionButtonHelpers.jsx";
import MainLoader from "../components/MainLoader.jsx";
import {notification} from "../components/ToastNotification.jsx";
import ReactToPrint from "react-to-print";
import {checkPermission} from "../helper/HelperFunctions.js";


import useTable, { emptyRows, getComparator } from "../hooks/useTable.js";
import {
  Box,
  Card,
  Table,
  Switch,
  Button,
  Divider,
  TableBody,
  Container,
  TableContainer,
  TablePagination,
  FormControlLabel,
  Backdrop,
} from "@mui/material";
import {
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TableToolbar,
} from "../components/table/index.js";
import Scrollbar from "../components/Scrollbar.jsx";
import SectorTableRow from "../components/table/TableRows/SectorTableRow.jsx";
import HeaderBreadcrumbs from "../components/HeaderBreadcrumbs.jsx";
import Iconify from "../components/Iconify.jsx";
import { useNavigate } from "react-router-dom";

export default function Categories() {
    const navigate = useNavigate()
    const [tableData, setTableData] = useState([]);
    const [filterName, setFilterName] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [filterStatus, setFilterStatus] = useState(1);
  
    const TABLE_HEAD = [
      { id: "id", label: "ID", align: "left" },
      { id: "sector", label: "Sector", align: "left" },
      { id: "electricity", label: "Electricity next payment", align: "left" },
      { id: "internet", label: "Internet next payment", align: "left" },
      { id: "cheque", label: "Cheque next payment", align: "left" },
      { id: "action", label: "Actions", align: "right" },
      { id: "" },
    ];
    const {
      dense,
      page,
      order,
      orderBy,
      rowsPerPage,
      setPage,
      //
      selected,
      onSelectRow,
      //
      onSort,
      onChangeDense,
      onChangePage,
      onChangeRowsPerPage,
    } = useTable();
  
    const dataFiltered = applySortFilter({
      tableData,
      comparator: getComparator(order, orderBy),
      filterName,
      filterRole,
      filterStatus,
    });
  
    const denseHeight = dense ? 52 : 72;
  
    const isNotFound =
      (!dataFiltered.length && !!filterName) ||
      (!dataFiltered.length && !!filterRole) ||
      (!dataFiltered.length && !!filterStatus);
  
    const handleFilterName = (filterName) => {
      setFilterName(filterName);
      setPage(0);
    };
  
    const handleFilterRole = (event) => {
      setFilterRole(event.target.value);
    };
  











    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState(null);
    const [category, setCategory] = useState({
        id: null,
        sector_id: null,
        name: '',
        type: 'income'
    });
    const [sectors, setSector] = useState([])
    const [selectedSectorId, setSelectedSectorId] = useState('');
    const [categoryType, setCategoryType] = useState('');

    const {applicationSettings, userRole,userPermission} = useContext(SettingsContext);
    const {
        num_data_per_page
    } = applicationSettings;
    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    const filteredCategories = categories.filter(
        (category) =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.type.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const showCreateModal = () => {
        setErrors(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };
    const {setNotification} = useStateContext();

    const categorySubmit = (event) => {
        event.preventDefault();
        setLoading(true)
        if (category.id) {
            axiosClient.put(`/category/${category.id}`, category)
                .then((data) => {
                    // setNotification("Category has been successfully updated");

                    setShowModal(false);
                    getCategories(currentPage, pageSize);
                    setCategory({
                        id: null,
                        name: '',
                        type: 'income',
                        sector_id: null
                    });

                    notification('success', data?.message, data?.description)
                    setLoading(false)
                }).catch(err => {
                if (err.response) {
                    const error = err.response.data
                    notification('error', error?.message, error.description)
                }
                setLoading(false)
            });
        } else {
            axiosClient.post('category/add', category).then((data) => {
                // setNotification(`${category.name} was successfully created`);
                setShowModal(false);
                getCategories(currentPage, pageSize);
                setCategory({
                    id: null,
                    name: '',
                    type: 'income',
                    sector_id: null
                });

                notification('success', data?.message, data?.description)
                setLoading(false)
            }).catch(err => {
                if (err.response) {
                    const error = err.response.data
                    notification('error', error?.message, error.description)
                }
                setLoading(false)
            });
        }
    };

    const edit = (category) => {
        setCategory(category);
        setErrors(null);
        setShowModal(true);
    };

    const onDelete = (category) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover the category ${category.name}!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient
                    .delete(`category/${category.id}`)
                    .then((data) => {
                        getCategories(currentPage, pageSize);
                        notification('success', data?.message, data?.description)
                    }).catch(err => {
                    if (err.response) {
                        const error = err.response.data
                        notification('error', error?.message, error.description)
                    }
                })
            }
        });
    };

    useEffect(() => {
        document.title = "Categories";
        axiosClient.get('/sectors-list')
            .then(({data}) => {
                setSector(data.sectors);
            })
            .catch(error => {
                console.warn('Error fetching bank accounts:', error)
            });


        getCategories(currentPage, pageSize);
    }, [currentPage, pageSize, setSector]); // Fetch categories when currentPage or pageSize changes
    const handelCategoryFilterSubmit = (e) => {
        e.preventDefault();
        getCategories();
    };
    const getCategories = (page, pageSize) => {
        setLoading(true);
        axiosClient
            .get("/categories", {params: {page, pageSize, selectedSectorId,categoryType}})
            .then(({data}) => {
                setLoading(false);
                setCategories(data.data);
                setTableData(data.data)
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const paginationItems = [];
    for (let i = 1; i <= totalPages; i++) {
        paginationItems.push(
            <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => handlePageChange(i)}
            >
                {i}
            </Pagination.Item>
        );
    }

    const actionParams = {
        route: {
            viewRoute: '',
            deleteRoute: ''
        },
    }

    const resetFilterParameter = () => {
        setSelectedSectorId('')
        setCategoryType('')
        getCategories();
    };

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <WizCard className="animated fadeInDown">
                <div className="row mb-4">
                    <form onSubmit={handelCategoryFilterSubmit}>
                        <div className={"col-md-3 col-sm-3 col-3"}>
                            <div className="form-group">
                                <select
                                    className="custom-form-control"
                                    value={selectedSectorId}
                                    id="income-category"
                                    name="income-category"
                                    onChange={(event) => {
                                        const value = event.target.value || '';
                                        setSelectedSectorId(value);
                                    }}>
                                    <option defaultValue>Filter by Sectors</option>
                                    {sectors.map(sector => (
                                        <option key={sector.id} value={sector.id}>
                                            {sector.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                        <div className={"col-md-3 col-sm-3 col-3"}>
                            <div className="form-group">
                                <select
                                    className="custom-form-control"
                                    value={categoryType}
                                    id="category-type"
                                    name="category-type"
                                    onChange={(event) => {
                                        const value = event.target.value || '';
                                        setCategoryType(value);
                                    }}>
                                    <option defaultValue>Filter by Type</option>
                                    <option key={'expense'} value={"expense"}>{"Expense"}</option>
                                    <option key={'income'} value={"income"}>{"Income"}</option>
                                </select>
                            </div>

                        </div>
                        <div className="col-md-3 col-sm-3 col-3">
                            <input
                                className="custom-form-control"
                                type="text"
                                placeholder="Search category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-3">
                            <button className={'btn-add right'} type="submit">Filter</button>
                            <button className={"btn btn-warning ml-2"} onClick={resetFilterParameter}>Reset</button>
                            {checkPermission(userPermission.category_create) &&
                                <button className="btn-add ml-2" onClick={showCreateModal}>Add New</button>
                            }
                        </div>
                    </form>
                </div>
                <div className="table-responsive-sm">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr>
                            {
                                userRole === 'admin'&&
                                <th>id</th>
                            }
                            <th>CATEGORY NAME</th>
                            <th className="text-center">CATEGORY TYPE</th>
                            {userRole === 'admin' && <th>ACTIONS</th>}

                        </tr>
                        </thead>
                        {loading && (
                            <tbody>
                            <tr>
                                <td colSpan={3} className="text-center">
                                    Loading...
                                </td>
                            </tr>
                            </tbody>
                        )}
                        {!loading && (
                            <tbody>
                            {filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id}>
                                        {
                                            userRole === 'admin'&&
                                            <td>{category.id}</td>
                                        }
                                        <td>{category.name}</td>
                                        <td className="text-center">{category.type}</td>

                                        {userRole === 'admin' &&
                                            <td>
                                                <ActionButtonHelpers
                                                    module={category}
                                                    deleteFunc={onDelete}
                                                    showEditDropdown={edit}
                                                    params={actionParams}
                                                    editDropdown={userPermission.category_edit}
                                                    showPermission={userPermission.category_view}
                                                    deletePermission={userPermission.category_delete}

                                                />
                                            </td>}

                                    </tr>
                                ))
                            )}
                            </tbody>
                        )}
                    </table>
                </div>
                {totalPages > 1 && (
                    <Pagination>
                        <Pagination.Prev
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        />
                        {paginationItems}
                        <Pagination.Next
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        />
                    </Pagination>
                )}
            </WizCard>

            <Modal show={showModal} centered onHide={handleCloseModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {category.id && <span>Update Category: {category.name}</span>}
                        {!category.id && <span>Add New Category</span>}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="custom-form">
                        <div className="form-group">
                            <label htmlFor="category_name" className="custom-form-label">Category Name</label>
                            <input
                                value={category.name}
                                className="custom-form-control"
                                onChange={e => setCategory({...category, name: e.target.value})}
                                placeholder="Category Name"
                            />

                            {errors && errors.name && (
                                <div className="text-danger mt-2">{errors.name[0]}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="category_type" className="custom-form-label">Category Type</label>
                            <select
                                value={category.type}
                                className="custom-form-control"
                                onChange={e => setCategory({...category, type: e.target.value})}
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>

                            {errors && errors.type && (
                                <div className="text-danger mt-2">{errors.type[0]}</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="category_type" className="custom-form-label">Sector</label>
                            <select
                                value={category.sector_id}
                                className="custom-form-control"
                                id="sector-id"
                                name="sector-id"
                                onChange={e => setCategory({...category, sector_id: e.target.value})}>
                                <option defaultValue>Sector</option>
                                {sectors.map(sector => (
                                    <option key={sector.id} value={sector.id}>
                                        {sector.name}
                                    </option>
                                ))}
                            </select>

                            {errors && errors.sector_id && (
                                <div className="text-danger mt-2">{errors.sector_id[0]}</div>
                            )}
                        </div>

                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-sm" variant="primary" onClick={categorySubmit}>
                        Save
                    </Button>
                    <Button className="btn-sm" variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

