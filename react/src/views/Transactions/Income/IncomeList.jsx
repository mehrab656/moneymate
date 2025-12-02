import React, {useEffect, useState, useContext} from "react";
import Swal from "sweetalert2";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import {notification} from "../../../components/ToastNotification.jsx";
import IncomeFilter from "./Components/IncomeFilter.jsx";
import {
    useGetIncomeDataQuery,
    useDeleteIncomeMutation
} from "../../../api/slices/incomeSlice.js";
import IncomeFormSidebar from "./IncomeFormSidebar.jsx";
import IncomeDetails from "./IncomeDetails.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload, faFilter} from "@fortawesome/free-solid-svg-icons";
import {Form} from "react-bootstrap";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import FilteredParameters from "../Expense/Components/FilteredParameters.jsx";
import ListTable from "./Components/ListTable.jsx";
import CsvFileUpload from "./Components/CsvFileUpload.jsx";

const defaultQuery = {
    type: "",
    income_type: [],
    orderBy: "",
    order: "",
    limit: "",
    to_date: "",
    from_date: "",
    account_id: "",
    start_date: "",
    end_date: "",
    sectorIDS: [],
    sectorNames: [],
    check_for:"checkinout",
    check_from:"",
    check_to:"",
    reference:[],


};
const TABLE_HEAD = [
    {id: "date", label: "Date", align: "left"},
    {id: "description", label: "Description", align: "left"},
    {id: "sector", label: "Sector", align: "left"},
    {id: "category_name", label: "Source", align: "left"},
    {id: "amount", label: "Amount", align: "right"},
];
export default function IncomeList() {
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const {applicationSettings, userRole, userPermission} = useContext(SettingsContext);
    const [incomes, setIncomes] = useState([]);
    const [income, setIncome] = useState({});
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showCsvForm, setShowCsvForm] = useState(false)
    const [showMainLoader, setShowMainLoader] = useState(false);
    const [query, setQuery] = useState(defaultQuery);
    const {num_data_per_page,default_currency} = applicationSettings;
    const [isPaginate, setIsPaginate] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);//important
    const [hasFilter, setHasFilter] = useState(true);
    const [searchTerms, setSearchTerms] = useState("");
    const { showLargeContent, showQuickDetails } = useSidebarActions();


    useEffect(() => {
        if (num_data_per_page>0){
            setQuery({...query,limit: num_data_per_page})
        }
    }, []);
    const toggleFilterModal = () => {
        setShowFilterModal(!showFilterModal);
        setHasFilter(false);
    }
    const pageSize =
        Number(query.limit) > 0
            ? Number(query.limit)
            : num_data_per_page
                ? num_data_per_page
                : 10;
    const totalPages = Math.ceil(totalCount / pageSize);


    // api call
    const { data: getIncomeData, isFetching: incomeDataFetching, isError: incomeDataError, refetch } =
        useGetIncomeDataQuery(
            { currentPage, pageSize, query: query },
            { skip: !hasFilter, refetchOnMountOrArgChange: isPaginate }
        );
    const [deleteIncome] = useDeleteIncomeMutation();

    const onDelete = (income) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover the income!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await deleteIncome({id: income.id}).unwrap(); // Using unwrap for error handling
                    notification("success", response.message, response.description); // Display success message
                } catch (error) {
                    notification(
                        "error",
                        error.data.message,
                        error.data.description || "An error occurred."
                    ); // Display error message
                }
            }
        });
    };
    const showIncomeFormFunc = () => {
        // Open Income form in GlobalSidebar large content
        showLargeContent(
            "Add New Income",
            <IncomeFormSidebar
                incomeId={null}
                onSuccess={() => {
                    setIsPaginate(true);
                    refetch();
                }}
            />
        );
    };
    const showCsvIncomeFormFunc = () => {
        setShowCsvForm(true);
    };
    const closeCreateModalFunc = () => {
        setShowIncomeForm(false);
        setIncome({});
    };
    const closeCsvFileUploadModalFunc = () => {
        setShowCsvForm(false);
        setIncome({});
    };
    const showEditModalFunc = (income) => {
        setIncome(income);
        showLargeContent(
            "Edit Income",
            <IncomeFormSidebar
                incomeId={income.id}
                onSuccess={() => {
                    setIsPaginate(true);
                    refetch();
                }}
            />
        );
    };


    const showViewModalFunc = (income) => {
        setIncome(income);
        // Open details in GlobalSidebar quick details (consistent with Expense)
        showQuickDetails(
            "Income Details",
            <IncomeDetails data={income} />
        );
    };


    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        setIsPaginate(true);
    };

    const handelFilter = () => {
        setHasFilter(!hasFilter);
    };

    useEffect(() => {
        document.title = "Manage Incomes";
        const normalizedList = Array.isArray(getIncomeData?.data)
            ? getIncomeData.data
            : Array.isArray(getIncomeData?.incomes?.data)
                ? getIncomeData.incomes.data
                : Array.isArray(getIncomeData?.items)
                    ? getIncomeData.items
                    : Array.isArray(getIncomeData?.results)
                        ? getIncomeData.results
                        : [];

        const normalizedTotal =
            typeof getIncomeData?.total === 'number'
                ? getIncomeData.total
                : typeof getIncomeData?.incomes?.total === 'number'
                    ? getIncomeData.incomes.total
                    : typeof getIncomeData?.count === 'number'
                        ? getIncomeData.count
                        : normalizedList.length;

        if (normalizedList.length > 0 || incomeDataFetching) {
            setIncomes(normalizedList);
            setTotalCount(normalizedTotal);
            setShowMainLoader(false);
        } else if (incomeDataError) {
            setShowMainLoader(false);
            setIncomes([]);
        } else {
            setShowMainLoader(incomeDataFetching);
        }
        setIsPaginate(false);
    }, [getIncomeData, incomeDataFetching, incomeDataError, currentPage]);

    const filteredIncomes = incomes.filter((income) =>{
        return (income.description.toLowerCase().includes(searchTerms.toLowerCase()));
        });

    const actionParams = [
        {
            actionName: "Edit",
            type: "modal",
            route: "",
            actionFunction: showEditModalFunc,
            permission: "edit_income",
            textClass: "text-info",
        },
        {
            actionName: "View",
            type: "modal",
            route: "",
            actionFunction: showViewModalFunc,
            permission: "income_view",
            textClass: "text-warning",
        },
        {
            actionName: "Delete",
            type: "modal",
            route: "",
            actionFunction: onDelete,
            permission: "income_delete",
            textClass: "text-danger",
        },

    ];
    const submitFilter = ()=>{
        setHasFilter(true);
        setShowFilterModal(false);
    }
    const resetFilterParameter = () => {
        setQuery(defaultQuery);
        setHasFilter(!hasFilter);
    };
    const closeFilterModal = ()=>{
        setHasFilter(!hasFilter);
        setShowFilterModal(false);

    }
    return (
        <div>
            <MainLoader loaderVisible={showMainLoader}/>
            <div className={"row mb-2"}>
                <div className={"col-md-4"}>
                    <span className={"page-title-header"}>Incomes</span>
                </div>
                <div className={"col-md-8 text-end"}>
                    <button className={'btn btn-secondary btn-sm mr-2'}>
                        <FontAwesomeIcon icon={faDownload}/>{' Download CSV'}
                    </button>
                    <button className={'btn btn-sm btn-primary mr-2'} onClick={showIncomeFormFunc}>
                        <FontAwesomeIcon icon={faFilter}/>{' Add Income'}
                    </button>
                    <button className={'btn btn-sm btn-success'} onClick={showCsvIncomeFormFunc}>
                        <FontAwesomeIcon icon={faFilter}/>{' Upload CSV'}
                    </button>
                </div>
            </div>
            <div className={"row mb-2"}>
                <div className={"col-md-8"}>
                    <button className={'btn btn-secondary btn-sm mr-2'} onClick={toggleFilterModal}>
                        <FontAwesomeIcon icon={faFilter}/>{' Filter'}</button>
                </div>

                <div className={"col-md-4"}>
                    <Form.Control
                        type="text"
                        size="sm"
                        value={searchTerms}
                        onChange={(e) => setSearchTerms(e.target.value)}
                        placeholder={"search by key wards..."}
                        style={{textTransform: "capitalize"}}
                    />
                </div>
            </div>
            <div className="row mb-2">
                <FilteredParameters queries={query}
                                    setQuery={setQuery}/>
            </div>
            <ListTable incomes={filteredIncomes}
                       tableColumns={TABLE_HEAD}
                       actionBtns={actionParams}
                       loading={loading}
                       paginations={{
                           totalPages: totalPages??0,
                           totalCount: totalCount,
                           currentPage: currentPage,
                           handlePageChange: handlePageChange,
                       }}
                       cardSubTitle={`Page-${currentPage} (showing ${filteredIncomes.length} results from ${totalCount})`}
                       isFetching={incomeDataFetching}
                       hasError={incomeDataError}
            />

            {/* Income create/edit handled via GlobalSidebar */}
            {showCsvForm && (
                <CsvFileUpload
                    handelCloseModal={closeCsvFileUploadModalFunc}
                    title={"Upload Csv Income File"}
                />
            )}
            {/* Income details now handled via GlobalSidebar quick details */}

            {showFilterModal && (
                <IncomeFilter
                    showModal={showFilterModal}
                    closeModal={closeFilterModal}
                    resetFilter={resetFilterParameter}
                    submitFilter={submitFilter}
                    queryParams={query}
                    setQueryParams={setQuery}
                    setHasFilter={setHasFilter}
                />)}
        </div>
    );
}
