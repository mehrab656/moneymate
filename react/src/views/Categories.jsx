import React, { useEffect, useState, useContext, useRef } from "react";
import axiosClient from "../axios-client.js";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import { useStateContext } from "../contexts/ContextProvider";
import { SettingsContext } from "../contexts/SettingsContext";
import MainLoader from "../components/MainLoader.jsx";
import { notification } from "../components/ToastNotification.jsx";

import useTable, { emptyRows, getComparator } from "../hooks/useTable.js";
import {
  Box,
  Card,
  Table,
  Switch,
  Button,
  TableBody,
  Container,
  TableContainer,
  TablePagination,
  FormControlLabel,
} from "@mui/material";
import {
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TableToolbar,
} from "../components/table/index.js";
import Scrollbar from "../components/Scrollbar.jsx";
import HeaderBreadcrumbs from "../components/HeaderBreadcrumbs.jsx";
import { useNavigate } from "react-router-dom";
import CategoryTableRow from "../components/table/TableRows/CategoryTableRow.jsx";
import CreateBtnComponent from "../components/createBtnComponent.jsx";
import { PrintBtn } from "../components/PrintBtnComponent.JSX";
import { useCreateCategoryMutation, useDeleteCategoryMutation, useGetCategoryDataQuery, useGetCategorySectorListDataQuery } from "../api/slices/categorySlice.js";
import {checkPermission} from "../helper/HelperFunctions.js";

const typeOption = [
  {id:1, name:'income'},
  {id:2, name:'expense'}
]
const TABLE_HEAD = [
  { id: "id", label: "ID", align: "left" },
  { id: "name", label: " Category Name", align: "left" },
  { id: "type", label: "Category Type", align: "left" },
  { id: "action", label: "Actions", align: "right" },
  { id: "" },
];

export default function Categories() {
  const componentRef  = useRef()
  const [tableData, setTableData] = useState([]);

  const {
    dense,
    page,
    order,
    orderBy,
    //
    selected,
    onSelectRow,
    //
    onSort,
    onChangeDense,
  } = useTable();

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState(null);
  const [category, setCategory] = useState({
    id: null,
    sector_id: null,
    name: "",
    type: "income",
  });
  const [sectors, setSector] = useState([]);

  const { applicationSettings, userPermission } = useContext(SettingsContext);
  const { num_data_per_page } = applicationSettings;
  const pageSize = num_data_per_page;
  const totalPages = Math.floor(totalCount / pageSize);

  //Filter By
  const [filterName, setFilterName] = useState("");
  const [filterSecterValue, setFilterSeacterValue] = useState('')
  const [filterTypeValue, setFilterTypeValue] = useState('')

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const denseHeight = dense ? 52 : 72;
  const isNotFound =(!dataFiltered.length && !!filterName) 

  const defaultQuery = {
    selectedSectorId : filterSecterValue,

  }

  // api call
  const {user, token} = useStateContext();
  const {data: getCategoryData, isFetching: getCategoryDataFetching, isError:getCategoryDataError} = useGetCategoryDataQuery({currentPage,pageSize,selectedSectorId:filterSecterValue, categoryType:filterTypeValue});
  const {data: getCategorySectorListData, isFetching: getCategorySectorListDataFetching, isError:getCategorySectorListDataError} = useGetCategorySectorListDataQuery({token});

  const [createCategory] = useCreateCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()

  const getCategories = (page, pageSize) => {
    setLoading(true);
    axiosClient
      .get("/categories", {
        params: { page: page + 1, pageSize, selectedSectorId:filterSecterValue, categoryType:filterTypeValue},
      })
      .then(({ data }) => {
        setTableData(data.data);
        setTotalCount(data.total);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = "Categories";
    if(getCategoryData?.data){
      setTableData(getCategoryData.data);
      setTotalCount(getCategoryData.total);
    }
    if(getCategorySectorListData?.sectors){
      setSector(getCategorySectorListData.sectors);
    }

    // if(sectors && sectors?.length ===1){
    //   setCategory({...category,sector_id:sectors[0].id})
    // }

  }, [getCategoryData,getCategorySectorListData]); 

  const handleFilterName = (filterName) => {
    setFilterName(filterName);
    setCurrentPage(0);
  };
  const onChangeSectorFilter = (event)=>{
    setFilterSeacterValue(event.target.value)
  }
  const onChangeTypeFilter = (event)=>{
    setFilterTypeValue(event.target.value)
  }

  // handleResetFilter
    const handleResetFilter = ()=>{
      setFilterName("")
      setFilterSeacterValue("");
      setFilterTypeValue("");
    }

  const showCreateModal = () => {
    setErrors(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const categorySubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    if (category.id) {
      axiosClient
        .put(`/category/${category.id}`, category)
        .then((data) => {
          setShowModal(false);
          getCategories(currentPage, pageSize);
          setCategory({
            id: null,
            name: "",
            type: "income",
            sector_id: null,
          });

          notification("success", data?.message, data?.description);
          setLoading(false);
        })
        .catch((err) => {
          if (err.response) {
            const error = err.response.data;
            notification("error", error?.message, error.description);
          }
          setLoading(false);
        });
    } else {
      // axiosClient
      //   .post("category/add", category)
      //   .then((data) => {
      //     setShowModal(false);
      //     getCategories(currentPage, pageSize);
      //     setCategory({
      //       id: null,
      //       name: "",
      //       type: "income",
      //       sector_id: null,
      //     });

      //     notification("success", data?.message, data?.description);
      //     setLoading(false);
      //   })

        // let formData = new FormData(); //formdata object
        // formData.append("name", category?.name);
        // formData.append("type", category?.type);
        // formData.append("sector_id", category?.sector_id);
        
        createCategory({token,formData:category})
        .unwrap()
        .then((response) => {
          setShowModal(false);
          notification("success", data?.message, data?.description);
        })
        .catch((err) => {
          if (err.error) {
            const error = err.error;
            notification("error", error?.message, error.description);
          }
          setLoading(false);
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
        deleteCategory({token,id:category?.id})
      }
    });
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };


  return (
    <div>
      <MainLoader loaderVisible={(getCategoryDataFetching)} />

      <Container maxWidth={"xl"}>
        <Card sx={{ p: 5 }}>
          <HeaderBreadcrumbs
            heading="Category Lists"
            links={[
              { name: "Dashboard", href: "/" },
              { name: "Category" },
              { name: "List" },
            ]}
            action={
              <CreateBtnComponent
                path={''}
                action={showCreateModal}
                status={checkPermission("category_create")}
                title={'Add Category'}
               />
            }
          />

          <TableToolbar
            filterByText={true}
            searchText={"Search Category..."}
            filterName={filterName}
            onFilterName={handleFilterName}

            filterBySectowShow={true}
            filterSecterValue={filterSecterValue}
            onChangeSectorFilter={onChangeSectorFilter}
            filterSectorOption={sectors}

            filterBytypeShow={true}
            filterTypeValue={filterTypeValue}
            onChangeTypeFilter={onChangeTypeFilter}
            filterTypeOption={typeOption}

            filterDisabled = {(filterName ==='' && filterSecterValue ==='' && filterTypeValue ==='' )?true:false}
            handleResetFilter={handleResetFilter}

            printShow={false}
            printComponent={PrintBtn(componentRef.current)}

          />

          <Scrollbar>
            <TableContainer ref={componentRef}>
              <Table size={dense ? "small" : "medium"}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  userPermission={userPermission}
                />
                <TableBody >
                  {dataFiltered
                    .slice(page * pageSize, page * pageSize + pageSize)
                    .map((row) => (
                      <CategoryTableRow
                        key={row.id}
                        row={row}
                        userPermission={userPermission}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onEditRow={() => edit(row)}
                        onDeleteRow={() => onDelete(row)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(page, pageSize, tableData.length)}
                  />

                  <TableNoData isNotFound={(isNotFound || tableData.length===0)?true:false} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

        {pageSize && 
            <Box sx={{ position: "relative" }}>
              <TablePagination
                rowsPerPageOptions={[pageSize]}
                component="div"
                count={totalPages}
                rowsPerPage={pageSize}
                page={currentPage}
                onPageChange={handlePageChange}
              />
              <FormControlLabel
                control={<Switch checked={dense} onChange={onChangeDense} />}
                label="Dense"
                sx={{
                  px: 3,
                  py: 1.5,
                  top: 0,
                  position: { md: "absolute" },
                }}
              />
            </Box>
          }
        </Card>
      </Container>

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
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
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


// ----------------------------------------------------------------------

function applySortFilter({
  tableData,
  comparator,
  filterName,
}) {
  const stabilizedThis = tableData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tableData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    tableData = tableData.filter(
      (item) =>
        item.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return tableData;
}

