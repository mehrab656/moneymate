import React, { useEffect, useState, useContext, useRef } from "react";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import { useStateContext } from "../../contexts/ContextProvider.jsx";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import { notification } from "../../components/ToastNotification.jsx";
import { faBuildingFlag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@mui/material";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryDataQuery,
  useGetCategorySectorListDataQuery,
} from "../../api/slices/categorySlice.js";
import { checkPermission } from "../../helper/HelperFunctions.js";
import CommonTable from "../../helper/CommonTable.jsx";
import CategoryFilter from "./CategoryFilter.jsx";

const TABLE_HEAD = [
  { id: "name", label: " Category Name", align: "left" },
  { id: "type", label: "Category Type", align: "left" },
];

const defaultQuery = {
  searchTerm: "",
  orderBy: "DESC",
  limit: 10,
  selectedSectorId: "",
  type: "",
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [errors, setErrors] = useState(null);
  const [query, setQuery] = useState(defaultQuery);
  const [isPaginate, setIsPaginate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [category, setCategory] = useState({
    id: null,
    sector_id: null,
    name: "",
    type: "income",
  });
  const [sectors, setSector] = useState([]);

  const { applicationSettings, userRole, userPermission } =
    useContext(SettingsContext);
  const { num_data_per_page } = applicationSettings;

  const pageSize =
    Number(query.limit) > 0
      ? Number(query.limit)
      : num_data_per_page
      ? num_data_per_page
      : 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  // api call
  const {
    data: getCategoryData,
    isFetching: categoryDataFetching,
    isError: categoryDataError,
  } = useGetCategoryDataQuery(
    { currentPage, pageSize, query },
    { skip: !pageSize, refetchOnMountOrArgChange: isPaginate }
  );

  const { user, token } = useStateContext();
  const {
    data: getCategorySectorListData,
    isFetching: getCategorySectorListDataFetching,
    isError: getCategorySectorListDataError,
  } = useGetCategorySectorListDataQuery({ token });

  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  useEffect(() => {
    document.title = "Categories";
    if (getCategoryData?.data) {
      setCategories(getCategoryData.data);
      setTotalCount(getCategoryData.total);
      setShowMainLoader(false);
    } else {
      setShowMainLoader(true);
    }
    setIsPaginate(false);
  }, [getCategoryData, currentPage]);

  useEffect(() => {
    if (getCategorySectorListData?.data) {
      setSector(getCategorySectorListData.data);
    }
  }, [getCategorySectorListData]);

  const categorySubmit = async (event) => {
    event.preventDefault();
    const url = category.id ? `/category/${category?.id}` : "/category/add";
    try {
      const data = await createCategory({ url: url, formData }).unwrap();
      notification("success", data?.message, data?.description);
      setShowModal(false);
    } catch (err) {
      setSaveBtnTxt("Save");
      notification(
        "error",
        err?.message || "An error occurred",
        err?.description || "Please try again later."
      );
    }
  };

  const resetFilterParameter = () => {
    setQuery(defaultQuery);
    setHasFilter(!hasFilter);
  };
  const filter = () => {
    return (
      <CategoryFilter
        placeHolderTxt="Search by name..."
        query={query}
        setQuery={setQuery}
        resetFilterParameter={resetFilterParameter}
      />
    );
  };

  const filteredcategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setIsPaginate(true);
  };
  const showFormFunc = () => {
    setShowCategoryForm(true);
    setShowModal(true);
  };
  const showEditModalFunc = (category) => {
    // setShowCategoryForm(true);
    // setCategory(category);
    setCategory(category);
    setShowModal(true);
  };
  const closeCreateModalFunc = () => {
    setShowCompanyForm(false);
    setCategory({});
  };

  const onDelete = async (category) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert the deletion of company ${category.name}!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteCategory({ id: category.id }).unwrap(); // Using unwrap for error handling
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
  const actionParams = [
    {
      actionName: "Edit",
      type: "modal",
      route: "",
      actionFunction: showEditModalFunc,
      permission: "company_edit",
      textClass: "text-info",
    },
    // {
    //   actionName: "View",
    //   type: "modal",
    //   route: "",
    //   actionFunction: showCategory,
    //   permission: "company_view",
    //   textClass: "text-warning",
    // },
    {
      actionName: "Delete",
      type: "modal",
      route: "",
      actionFunction: onDelete,
      permission: "company_delete",
      textClass: "text-danger",
    },
  ];

  return (
    <div>
      <MainLoader loaderVisible={categoryDataFetching} />
      <CommonTable
        cardTitle={"List of Categories"}
        addBTN={{
          permission: checkPermission("company_create"),
          txt: "Create New",
          icon: <FontAwesomeIcon icon={faBuildingFlag} />, //"faBuildingFlag",
          linkTo: "modal",
          link: showFormFunc,
        }}
        paginations={{
          totalPages: totalPages,
          totalCount: totalCount,
          currentPage: currentPage,
          handlePageChange: handlePageChange,
        }}
        table={{
          size: "small",
          ariaLabel: "company table",
          showIdColumn: userRole === "admin" ?? false,
          tableColumns: TABLE_HEAD,
          tableBody: {
            loading: loading,
            loadingColSpan: 6, //Table head length + 1
            rows: filteredcategories, //rendering data
          },
          actionButtons: actionParams,
        }}
        filter={filter}
        loading={categoryDataFetching}
        loaderRow={query?.limit}
        loaderCol={5}
      />

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        animation={false}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {category.id ? "Update Category" : "Add New Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-12">
              {errors && (
                <div className="alert alert-danger">
                  <ul className="mt-0 mb-0">
                    {Object.keys(errors).map((key) => (
                      <li key={key}>{errors[key][0]}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <form onSubmit={categorySubmit}>
            <div className="row">
              <div className="col-md-6">
                <label>Category Name</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  value={category.name}
                  onChange={(e) =>
                    setCategory({ ...category, name: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <label>Category Type</label>
                <select
                  className="form-control mb-3"
                  value={category.type}
                  onChange={(e) =>
                    setCategory({ ...category, type: e.target.value })
                  }
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="col-md-6">
                <label>Sector</label>
                <select
                  className="form-control mb-3"
                  value={category.sector_id}
                  onChange={(e) =>
                    setCategory({ ...category, sector_id: e.target.value })
                  }
                >
                  {sectors.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button variant="contained" color="primary" type="submit">
              {category.id ? "Update Category" : "Add Category"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
