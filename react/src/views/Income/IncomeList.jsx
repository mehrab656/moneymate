import React, {useEffect, useState, useContext} from "react";
import Swal from "sweetalert2";
import {SettingsContext} from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import {checkPermission} from "../../helper/HelperFunctions.js";
import {notification} from "../../components/ToastNotification.jsx";

import Iconify from "../../components/Iconify.jsx";
import CommonTable from "../../helper/CommonTable.jsx";
import IncomeFilter from "./IncomeFilter.jsx";
import {
    useGetIncomeDataQuery,
    useDeleteIncomeMutation
} from "../../api/slices/incomeSlice.js";
import ShowDetails from "./IncomeShow.jsx";
import IncomeForm from "./IncomeForm.jsx";
import IncomeShow from "./IncomeShow.jsx";

const defaultQuery = {
    category: "",
    type: "",
    income_type: "",
    orderBy: "",
    order: "",
    limit: 10,
    to_date: "",
    from_date: "",
    account_id: "",
};

export default function IncomeList() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const {applicationSettings, userRole, userPermission} = useContext(SettingsContext);
    const [incomes, setIncomes] = useState([]);
    const [income, setIncome] = useState({});
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showIncomeDetails, setShowIncomeDetails] = useState(false);
    const [showMainLoader, setShowMainLoader] = useState(false);
    const [query, setQuery] = useState(defaultQuery);
    const {num_data_per_page,default_currency} = applicationSettings;
    const [isPaginate, setIsPaginate] = useState(false);

    const [hasFilter, setHasFilter] = useState(false);
    const TABLE_HEAD = [
        {id: "date", label: "Date", align: "left"},
        {id: "description", label: "Description", align: "left"},
        {id: "category_name", label: "Source", align: "left"},
        {id: "amount", label: "Amount", align: "right"},
    ];

    const pageSize =
        Number(query.limit) > 0
            ? Number(query.limit)
            : num_data_per_page
                ? num_data_per_page
                : 10;
    const totalPages = Math.ceil(totalCount / pageSize);

    // api call
    const {
        data: getIncomeData,
        isFetching: incomeDataFetching,
        isError: incomeDataError,
    } = useGetIncomeDataQuery(
        {currentPage, pageSize, query: query},
        {refetchOnMountOrArgChange: isPaginate}
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
        setShowIncomeForm(true);
    };
    const closeCreateModalFunc = () => {
        setShowIncomeForm(false);
        setIncome({});
    };
    const showEditModalFunc = (income) => {
        setShowIncomeForm(true);
        setIncome(income);
    };


    const showViewModalFunc = (income) => {
        setShowIncomeDetails(true);
        setIncome(income);
    };
    const closeViewModalFunc = () => {
        setShowIncomeDetails(false);
        setIncome({});
    };


    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        setIsPaginate(true);
    };
    const resetFilterParameter = () => {
        setQuery(defaultQuery);
        setHasFilter(!hasFilter);
    };
    const handelFilter = () => {
        setHasFilter(!hasFilter);
    };

    useEffect(() => {
        document.title = "Manage Incomes";
        if (getIncomeData?.data) {
            setIncomes(getIncomeData.data);
            setTotalCount(getIncomeData.total);
            setShowMainLoader(false);
        } else {
            setShowMainLoader(true);
        }
        setIsPaginate(false);
    }, [getIncomeData, currentPage]);

    const filteredIncomes = incomes.filter(
        (income) => income.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filters = () => {
        return (
            <IncomeFilter
                search={{
                    filterByText: true,
                    placeHolderTxt: "Search by name...",
                    searchBoxValue: searchTerm,
                    handelSearch: setSearchTerm,
                }}
                query={query}
                setQuery={setQuery}
                resetFilterParameter={resetFilterParameter}
                handelFilter={handelFilter}
            />
        );
    };

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

    return (
        <div>
            <MainLoader loaderVisible={showMainLoader}/>
            <CommonTable
                cardTitle={"List of Incomes"}
                addBTN={{
                    permission: checkPermission("income_create"),
                    txt: "New Income",
                    icon: <Iconify icon={"eva:plus-fill"}/>, //"faBuildingFlag",
                    linkTo: "modal",
                    link: showIncomeFormFunc,
                }}
                paginations={{
                    totalPages: totalPages,
                    totalCount: totalCount,
                    currentPage: currentPage,
                    handlePageChange: handlePageChange,
                }}
                table={{
                    size: "small",
                    ariaLabel: "income table",
                    showIdColumn: userRole === "admin" ?? false,
                    tableColumns: TABLE_HEAD,
                    tableBody: {
                        loading: incomeDataFetching,
                        loadingColSpan: 4,
                        rows: filteredIncomes, //rendering data
                    },
                    actionButtons: actionParams,
                }}
                filter={filters}
                loading={incomeDataFetching}
                loaderRow={query?.limit}
                loaderCol={4}
            />

            {showIncomeForm && (
                <IncomeForm
                    handelCloseModal={closeCreateModalFunc}
                    title={"Create New Income"}
                    id={income.id}
                />
            )}
            {showIncomeDetails && (
                <IncomeShow handleCloseModal={closeViewModalFunc}
                            data={income}
                            currency={default_currency}
                />
            )}
        </div>
    );
}
