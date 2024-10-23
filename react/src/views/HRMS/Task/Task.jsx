import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../../axios-client.js";
import Swal from "sweetalert2";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/MainLoader.jsx";
import { checkPermission } from "../../../helper/HelperFunctions.js";
import { notification } from "../../../components/ToastNotification.jsx";

import Iconify from "../../../components/Iconify.jsx";
import CommonTable from "../../../helper/CommonTable.jsx";
import TaskAddModal from "./TaskAddModal.jsx";
import TaskFilters from "./TaskFilters.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import TaskHistoryModal from "./TaskHistoryModal.jsx";
import ShowTaskModal from "./ShowTaskModal.jsx";
import UpdatePaymentStatusModal from "./UpdatePaymentStatusModal.jsx";
import UpdateStatus from "./UpdateStatus.jsx";
import { useStateContext } from "../../../contexts/ContextProvider.jsx";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskDataQuery,
} from "../../../api/slices/taskSlice.js";
import { TableLoader } from "../../../components/SkeletonLoader/TableLoader.jsx";

const defaultTaskData = {
  description: "",
  employee: "",
  categoryID: "",
  employee_list: [],
  date: "",
  startTime: "",
  endTime: "",
  type: "income",
  amount: "",
  status: "pending",
  payment_status: "pending",
  workflow: [],
  comment: "",
};
const defaultQuery = {
  employee_id: "",
  status: "",
  payment_status: "",
  orderBy: "",
  order: "",
  limit: 10,
  category_id: "",
  end_date: "",
  start_date: "",
};
export default function Task() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { applicationSettings, userRole, userPermission } =
    useContext(SettingsContext);
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState(defaultTaskData);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewTaskModal, setViewTaskModal] = useState(false);
  const [taskTimelineModal, setTaskTimelineModal] = useState(false);
  const [taskHistory, setTaskHistory] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const { num_data_per_page } = applicationSettings;
  const [isPaginate, setIsPaginate] = useState(false);

  const [hasFilter, setHasFilter] = useState(false);
  const TABLE_HEAD = [
    { id: "description", label: "Description", align: "left" },
    { id: "amount", label: "Amount", align: "right" },
    { id: "slot", label: "Slot", align: "left" },
    { id: "status", label: "Status", align: "left" },
    { id: "payment_status", label: "Payment", align: "left" },
    { id: "history", label: "History", align: "left" },
    { id: "type", label: "Type", align: "left" },
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
    data: getTaskData,
    isFetching: taskDataFetching,
    isError: taskDataError,
  } = useGetTaskDataQuery(
    { currentPage, pageSize, query: query },
    { refetchOnMountOrArgChange: isPaginate }
  );
  const [deleteTask] = useDeleteTaskMutation();

  const onDelete = (task) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover the task!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteTask({ id: task.id }).unwrap(); // Using unwrap for error handling
          notification("success", response.message, response.description); // Display success message
        } catch (error) {
          notification(
            "error",
            error.message,
            error.description || "An error occurred."
          ); // Display error message
        }
      }
    });
  };
  const showCreateModalFunc = () => {
    setShowCreateModal(true);
  };
  const closeCreateModalFunc = () => {
    setShowCreateModal(false);
    setTask(defaultTaskData);
  };
  const showEditModalFunc = (task) => {
    setShowCreateModal(true);
    setTask(task);
  };
  const showTimelineModalFunc = (task) => {
    setTaskTimelineModal(true);
    setTaskHistory(task);
  };
  const closeTimelineModalFunc = () => {
    setTaskTimelineModal(false);
  };

  const showPaymentModalFunc = (task) => {
    if (task.task_status === "cancelled") {
      notification(
        "error",
        "Error",
        "Payment can not be updated for cancelled task."
      );
    } else {
      setShowPaymentStatusModal(true);
      setTask(task);
    }
  };
  const closePaymentModalFunc = (task) => {
    setShowPaymentStatusModal(false);
  };
  const showViewModalFunc = (task) => {
    setViewTaskModal(true);
    setTask(task);
  };
  const closeViewModalFunc = () => {
    setViewTaskModal(false);
  };
  const showStatusModalFunc = (task) => {
    setShowStatusModal(true);
    setTask(task);
  };
  const closeStatusModalFunc = () => {
    setShowStatusModal(false);
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
    document.title = "Manage Tasks";
    if (getTaskData?.data) {
      setTasks(getTaskData.data);
      setTotalCount(getTaskData.total);
      setShowMainLoader(false);
    } else {
      setShowMainLoader(true);
    }
    setIsPaginate(false);
  }, [getTaskData, currentPage]);

  const filteredTasks = tasks.filter(
    (task) => task.description.toLowerCase().includes(searchTerm.toLowerCase())
    // task.employee.toLowerCase().includes(searchTerm.toLowerCase());
  );

  const modifiedTaskData = filteredTasks.map(
    (
      {
        id,
        description,
        slot,
        employee_name,
        amount,
        status,
        payment_status,
        workflow,
        type,
      },
      index
    ) => {
      const task = {};
      const statusClass =
        status === "pending"
          ? "warning"
          : status === "complete"
          ? "success"
          : "danger";
      const PaymentStatusClass =
        payment_status === "pending"
          ? "warning"
          : payment_status === "paid"
          ? "success"
          : "info";

      // task.description=
      task.amount = amount;
      task.slot = slot;
      task.task_status = status;
      task.status = (
        <span className={`text-${statusClass}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
      task.payment_status = (
        <span className={`text-${PaymentStatusClass}`}>
          {(
            payment_status.charAt(0).toUpperCase() + payment_status.slice(1)
          ).replace("_", " ")}
        </span>
      );
      task.history = (
        <a
          onClick={() => showTimelineModalFunc(workflow)}
          style={{ cursor: "pointer" }}
          className={"text-primary"}
          data-tooltip-id="internet-account"
          data-tooltip-content={"Show this internet details"}
        >
          <span className="aside-menu-icon">
            <FontAwesomeIcon icon={faEye} />
          </span>
        </a>
      );
      task.type = type.charAt(0).toUpperCase() + type.slice(1);
      task.description = description;
      task.id = id;
      task.workflow = workflow;
      return task;
    }
  );

  const filters = () => {
    return (
      <TaskFilters
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
      actionName: "Edit",
      type: "modal",
      route: "",
      actionFunction: showEditModalFunc,
      permission: "edit_task",
      textClass: "text-info",
    },
    {
      actionName: "View",
      type: "modal",
      route: "",
      actionFunction: showViewModalFunc,
      permission: "task_view",
      textClass: "text-warning",
    },
    {
      actionName: "Delete",
      type: "modal",
      route: "",
      actionFunction: onDelete,
      permission: "task_delete",
      textClass: "text-danger",
    },
    {
      actionName: "Update Status",
      type: "modal",
      route: "",
      actionFunction: showStatusModalFunc,
      permission: "task_change_status",
      textClass: "text-primary",
    },
    {
      actionName: "Update Payment",
      type: "modal",
      route: "",
      actionFunction: showPaymentModalFunc,
      permission: "task_change_payment_status",
      textClass: "text-info",
    },
  ];

  return (
    <div>
      <MainLoader loaderVisible={showMainLoader} />
      <CommonTable
        cardTitle={"List of Tasks"}
        addBTN={{
          permission: checkPermission("task_create"),
          txt: "Add New Task",
          icon: <Iconify icon={"eva:plus-fill"} />, //"faBuildingFlag",
          linkTo: "modal",
          link: showCreateModalFunc,
        }}
        paginations={{
          totalPages: totalPages,
          totalCount: totalCount,
          currentPage: currentPage,
          handlePageChange: handlePageChange,
        }}
        table={{
          size: "small",
          ariaLabel: "task table",
          showIdColumn: userRole === "admin" ?? false,
          tableColumns: TABLE_HEAD,
          tableBody: {
            loading: loading,
            loadingColSpan: 9,
            rows: modifiedTaskData, //rendering data
          },
          actionButtons: actionParams,
        }}
        filter={filters}
        loading={taskDataFetching}
        loaderRow={query?.limit}
        loaderCol={9}
      />

      {showCreateModal && (
        <TaskAddModal
          handelCloseModal={closeCreateModalFunc}
          title={"Add new Task"}
          id={task.id}
        />
      )}

      {taskTimelineModal && (
        <TaskHistoryModal
          handelCloseModal={closeTimelineModalFunc}
          workflow={taskHistory}
        />
      )}

      {viewTaskModal && (
        <ShowTaskModal handelCloseModal={closeViewModalFunc} element={task} />
      )}

      {showPaymentStatusModal && (
        <UpdatePaymentStatusModal
          handelCloseModal={closePaymentModalFunc}
          element={task}
        />
      )}

      {showStatusModal && (
        <UpdateStatus handelCloseModal={closeStatusModalFunc} element={task} />
      )}
    </div>
  );
}
