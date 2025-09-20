import React, {useContext, useEffect, useState} from "react";
import Swal from "sweetalert2";
import {SettingsContext} from "../../contexts/SettingsContext";
import MainLoader from "../../components/loader/MainLoader.jsx";
import { notification } from "../../components/ToastNotification.jsx";
import {useGetDebtDataQuery,useDeleteDebtMutation} from "../../api/slices/debtSlice.js";
import {checkPermission} from "../../helper/HelperFunctions.js";
import Iconify from "../../components/Iconify.jsx";
import CommonTable from "../../helper/CommonTable.jsx";
import Filter from "./Filter.jsx";
import DebtCreate from "./DebtCreate.jsx";
const defaultQuery = {
    type: "",
    account_id: "",
    orderBy: "",
    order: "",
    limit: 10,
    end_date: "",
    start_date: "",
};
const defaultDebtData = {
    id: null,
    amount: 0,
    account_id: null,
    type: '',
    person: '',
    date: null,
    note: ''
};
export default function Debts() {

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debts, setDebts] = useState([]);
    const [debt, setDebt] = useState(defaultDebtData);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [query, setQuery] = useState(defaultQuery);
    const [showMainLoader, setShowMainLoader] = useState(false);
    const [subTitle,setSubTitle] = useState('');

    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        num_data_per_page,
    } = applicationSettings;

    const [hasFilter, setHasFilter] = useState(false);
    const TABLE_HEAD = [
        { id: "person", label: "Person", align: "left" },
        { id: "type", label: "Type", align: "left" },
        { id: "date", label: "date", align: "left" },
        { id: "amount", label: "Amount", align: "right" },
    ];

    const pageSize =
        Number(query.limit) > 0
            ? Number(query.limit)
            : num_data_per_page
                ? num_data_per_page
                : 10;
    const totalPages = Math.ceil(totalCount / pageSize);

    const {
        data: getDebtData,
        isFetching: isDebtDataFetching,
    } = useGetDebtDataQuery(
        { currentPage, pageSize, query: query },
    );

    const [deleteDebt] = useDeleteDebtMutation();

    const onDelete = (debt) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover the debt amount of ${debt.amount}!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then( async (result) => {
            if (result.isConfirmed) {
                try{
                    const response = await deleteDebt({id: debt.id}).unwrap();
                    notification("success", response.message, response.description); // Display success message
                }catch ( e ){
                    notification("error",e.message,e.description || "An error occurred.")
                }
            }
        });
    };

    const showCreateModal = () => {
        setShowAddModal(true);
    };
    const handleCloseModal = () => {
        setShowAddModal(false);
        setDebt(defaultDebtData);
    };
    useEffect(() => {
        document.title = "Debts / Loan";
        if (getDebtData?.data){
            setDebts(getDebtData?.data);
            setTotalCount(getDebtData?.total);
            setShowMainLoader(false);
            setSubTitle(`Showing ${getDebtData?.data.length} results of ${getDebtData.total}`);
        }else {
            setShowMainLoader(true);
        }

    }, [currentPage, getDebtData]);
    const filterDebts = debts.filter(
        (debt) =>
            debt.amount.includes(searchTerm) ||
            debt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            debt.person.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const modifiedDebtData = filterDebts.map(debt=>{
        return debt;
    });
    const resetFilterParameter = () => {
        setQuery(defaultQuery);
        setHasFilter(!hasFilter);
        setSearchTerm("");
    };
    const handelFilter = () => {
        setHasFilter(!hasFilter);
    };
    const filters = () => {
        return (
            <Filter
                search={{
                    filterByText: true,
                    placeHolderTxt: "Search Task...",
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
            actionName: 'Edit',
            type: "modal",
            route: "/manage-debt/",
            actionFunction: "",
            permission: 'debt_edit',
            textClass:'text-info',
        },
        {
            actionName: 'View',
            type: "modal",
            route: "",
            actionFunction: showAddModal,
            permission: 'debt_view',
            textClass:'text-warning'
        },
        {
            actionName: 'Delete',
            type: "modal",
            route: "",
            actionFunction: onDelete,
            permission: 'debt_delete',
            textClass:'text-danger'
        },
    ];

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };
    return (
        <div>
            <MainLoader loaderVisible={loading} />

            <CommonTable
                cardTitle={`Debt Lists`}
                cardSubTitle={subTitle}
                addBTN={{
                    permission: checkPermission("debt_create"),
                    txt: "Add Debt",
                    icon: <Iconify icon={"eva:plus-fill"} />, //"faBuildingFlag",
                    linkTo: "modal",
                    link: showCreateModal,
                }}
                paginations={{
                    totalPages: totalPages,
                    totalCount: totalCount,
                    currentPage: currentPage,
                    handlePageChange: handlePageChange,
                }}
                table={{
                    size: "small",
                    ariaLabel: "debt table",
                    showIdColumn: userRole === "admin" ?? false,
                    tableColumns: TABLE_HEAD,
                    tableBody: {
                        loading: loading,
                        loadingColSpan: 9,
                        rows: modifiedDebtData, //rendering data
                    },
                    actionButtons: actionParams,
                }}
                filter={filters}
                loading={isDebtDataFetching}
                loaderRow={query?.limit}
                loaderCol={3}
            />

            {showAddModal &&
                <DebtCreate show={showAddModal} closeFunc={handleCloseModal} />
            }
        </div>
    )
}
