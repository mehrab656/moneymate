import React, {useContext, useEffect, useRef, useState} from "react";
import axiosClient from "../axios-client.js";
import DatePicker from 'react-datepicker';
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import MainLoader from "../components/MainLoader.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowsToEye,
    faEye,
    faEyeDropper,
    faEyeSlash, faFilter,
    faListAlt, faPlus,
    faStreetView
} from "@fortawesome/free-solid-svg-icons";
import ExpenseModal from "../helper/ExpenseModal.jsx";
import {Tooltip} from "react-tooltip";
import {Col, Container, Row} from "react-bootstrap";
import NavDropdown from "react-bootstrap/NavDropdown";
import {Link} from "react-router-dom";
import ExpenseFilter from "../helper/filter-icons/ExpenseFilter.jsx";
import { Box, Button } from "@mui/material";
import ReactToPrint from "react-to-print";
import Pagination from "react-bootstrap/Pagination";
import IncomeExportButton from "../components/IncomeExportButton.jsx";
import {createData} from "../helper/HelperFunctions.js";
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell, {tableCellClasses} from "@mui/material/TableCell";
import {TablePagination} from "@mui/material";
import TableBody from '@mui/material/TableBody';
import {BeatLoader} from "react-spinners";
import {styled} from "@mui/material/styles";
import {makeStyles} from "@mui/styles";


const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 440,
    },
});
export default function ExpenseReport() {
    const [loading, setLoading] = useState(false);
    const [expenseReport, setExpenseReport] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [selectedSectorId, setSelectedSectorId] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [totalExpense, setTotalExpense] = useState(parseFloat(0).toFixed(2));
    const [searchParoms, setSearchParoms] = useState(null);
    const [activeModal, setActiveModal] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(20);

    const [modalData, setModalData] = useState({
        id: null,
        user_id: null,
        account_id: '', // Set default value to an empty string
        amount: '', // Set default value to an empty string
        refundable_amount: 0, // Set default value to an empty string
        refunded_amount: 0,
        category_id: null,
        description: '',
        reference: '',
        date: '',
        note: '',
        attachment: ''
    });
    const [hasFilter, setHasFilter] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const {applicationSettings} = useContext(SettingsContext);
    let {
        default_currency,
        num_data_per_page
    } = applicationSettings;

    if (default_currency === undefined) {
        default_currency = 'AED ';
    }

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);
    const showExpenseDetails = (expense, index) => {
        setActiveModal(index)
        setModalData(expense);
        setShowModal(true);
    }
    useEffect(() => {
        axiosClient.get('/expense-categories', {
            params: {sector_id: selectedSectorId ? selectedSectorId : null}
        })
            .then(({data}) => {
                setExpenseCategories(data.categories);
            })
            .catch(error => {
                console.error('Error loading expense categories:', error);
            });
    }, [selectedSectorId]);

    useEffect(() => {

        axiosClient.get('/sectors-list')
            .then(({data}) => {
                setSectors(data.sectors);
            }).catch(error => {
            console.warn('Error Loading sectors: ', error);
        });

    }, [])

    const handleCloseModal = () => {
        setActiveModal('');
        setShowModal(false);
    };
    const getExpenseReport = (page, pageSize) => {
        setLoading(true);
        setTotalExpense(0);
        axiosClient
            .get("/report/expense", {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    cat_id: selectedCategoryId,
                    sec_id: selectedSectorId,
                    search_terms: searchParoms,
                    page: page,
                    pageSize: pageSize,
                },
            })
            .then(({data}) => {
                setExpenseReport(data.expenses);
                setTotalExpense(data.totalExpense);
                setTotalCount(data.total);

                setLoading(false);
            }).catch((e) => {
            setLoading(false);
        })
    };

    useEffect(() => {
        document.title = "Expenses Report";
        getExpenseReport(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setHasFilter(true);
        getExpenseReport();
    };

    const resetFilterParameter = () => {
        setStartDate(null);
        setEndDate(null);
        setSelectedCategoryId(null);
        setSelectedSectorId(null);
        setHasFilter(false);
        getExpenseReport();
    };
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const classes = useStyles();

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <WizCard className="animated fadeInDown">
                <div className="row">
                    <div className="col-6">
                        <h6>{'Total Expense: ' + default_currency +' '+ totalExpense} </h6>
                    </div>
                    <div className="col-6">
                        <ExpenseFilter
                            handleSubmit={handleSubmit}
                            selectedSectorId={selectedSectorId}
                            setSelectedSectorId={setSelectedSectorId}
                            sectors={sectors}
                            selectedCategoryId={selectedCategoryId}
                            setSelectedCategoryId={setSelectedCategoryId}
                            expenseCategories={expenseCategories}
                            startDate={startDate}
                            setStartDate={setStartDate}
                            endDate={endDate}
                            setEndDate={setEndDate}
                            searchParoms={searchParoms}
                            setSearchParoms={setSearchParoms}
                            resetFilterParameter={resetFilterParameter}
                            hasFilter={hasFilter}
                        />
                    </div>
                </div>

                <TableContainer component={Paper}>
                    <Table  className={classes.table} size="small" aria-label="enhanced table">
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Expense Date</b></TableCell>
                                <TableCell><b>Expense Category</b></TableCell>
                                <TableCell><b>Description</b></TableCell>
                                <TableCell><b>Expense Amount</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                loading &&
                                <TableRow>
                                    <TableCell component="th" scope="row" colSpan={"4"} align={"center"}>
                                        <span><BeatLoader loading color="#36d7b7"/></span>
                                    </TableCell>
                                </TableRow>
                            }
                            {expenseReport.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((expense,index) => (
                                <TableRow key={expense.id}>
                                    <TableCell component="th" scope="row">{expense.date}</TableCell>
                                    <TableCell>{expense.category_name}</TableCell>
                                    <TableCell>{expense.description}
                                        <a onClick={() => showExpenseDetails(expense, index)}
                                           className={index === activeModal ? 'text-primary fa-pull-right ' : 'text-muted fa-pull-right'}
                                           data-tooltip-id='expense-details'
                                           data-tooltip-content={"View details"}>
                                                    <span className="aside-menu-icon">
                                                        <FontAwesomeIcon
                                                            icon={index === activeModal ? faEye : faEyeSlash}/>
                                                    </span>
                                        </a>
                                        <Tooltip id={"expense-details"}/>
                                    </TableCell>
                                    <TableCell>{default_currency + ' ' + expense.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[20, 50, 500]}
                    component="div"
                    count={expenseReport.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </WizCard>

            <ExpenseModal showModal={showModal}
                          handelCloseModal={handleCloseModal}
                          title={'Expense Details'}
                          data={modalData}
                          currency={default_currency}
            />
        </div>
)
}
