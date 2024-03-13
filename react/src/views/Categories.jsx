import React, {useEffect, useState, useContext} from "react";
import axiosClient from "../axios-client.js";
import Swal from "sweetalert2";
import Pagination from "react-bootstrap/Pagination";
import WizCard from "../components/WizCard";
import {Button, Modal} from "react-bootstrap";
import {useStateContext} from "../contexts/ContextProvider";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCoins} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../contexts/SettingsContext";
import ActionButtonHelpers from "../helper/ActionButtonHelpers.jsx";
import MainLoader from "../components/MainLoader.jsx";
import { notification } from "../components/ToastNotification.jsx";

export default function Categories() {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState(null);
    const [category, setCategory] = useState({
        id: null,
        sector_id:null,
        name: '',
        type: 'income'
    });
    const [sectors, setSector] = useState([])

    const {applicationSettings, userRole} = useContext(SettingsContext);
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
                        sector_id:null
                    });

                    notification('success',data?.message,data?.description)
                    setLoading(false)
                }).catch(err => {
                // const response = error.response;
                // if (response && response.status === 409) {
                //     setErrors({name: ['Category name already exists']});
                // } else if (response && response.status === 422) {
                //     setErrors(response.data.errors);
                // }
                if (err.response) { 
                    const error = err.response.data
                    notification('error',error?.message,error.description)
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

                notification('success',data?.message,data?.description)
                setLoading(false)
            }).catch(err => {
                // const response = error.response;
                // if (response && response.status === 409) {
                //     setErrors({name: ['Category name already exists']});
                // } else if (response && response.status === 422) {
                //     setErrors(response.data.errors);
                // }
                if (err.response) { 
                    const error = err.response.data
                    notification('error',error?.message,error.description)
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
                        // Swal.fire({
                        //     title: "Deleted!",
                        //     text: "Category has been deleted.",
                        //     icon: "success",
                        // });

                        notification('success',data?.message,data?.description)

                        
                    }).catch(err => {
                        if (err.response) { 
                            const error = err.response.data
                            notification('error',error?.message,error.description)
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

    const getCategories = (page, pageSize) => {
        setLoading(true);
        axiosClient
            .get("/categories", {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setCategories(data.data);
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

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Income & Expense Categories</h1>
                {userRole === 'admin' &&
                    <div>
                        <a className="custom-btn btn-add" onClick={showCreateModal}>
                            <FontAwesomeIcon icon={faCoins}/> Add New
                        </a>
                    </div>
                }

            </div>
            <WizCard className="animated fadeInDown">
                <div className="mb-4">
                    <input
                        className="custom-form-control"
                        type="text"
                        placeholder="Search category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="table-responsive-sm">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr>
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
                                        <td>{category.name}</td>
                                        <td className="text-center">{category.type}</td>

                                        {userRole === 'admin' &&
                                            <td>
                                                <ActionButtonHelpers
                                                    module={category}
                                                    deleteFunc={onDelete}
                                                    showEditDropdown={edit}
                                                    editDropdown={true}
                                                    params={actionParams}
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


