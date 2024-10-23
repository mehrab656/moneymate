import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../baseUrl";
import { globalToken } from "../globalToken"
import axiosClient from "../../axios-client";


export const taskSlice = createApi({
  reducerPath: "task",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["task"],
  endpoints: (builder) => ({
    getTaskData: builder.query({
      query: ({
        currentPage,
        pageSize,
        query
      }) => {
        return {
          url: `all-tasks?currentPage=${currentPage}&pageSize=${pageSize}&employee_id=${query?.employee_id}&status=${query?.status}&payment_status=${query?.payment_status}&orderBy=${query?.orderBy}&order=${query?.order}&limit=${query?.limit}&category_id=${query?.category_id}&end_date=${query?.end_date}&start_date=${query?.start_date}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${globalToken}`,
          },
        };
      },
      providesTags: ["task"],
    }),
    getSingleTaskData: builder.query({
      query: ({id}) => {
        if (typeof id !== "undefined"){
          return {
            url: `task/${id}`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${globalToken}`,
            },
          };
        }

      },
      providesTags: ["task"],
    }),

    createTask: builder.mutation({
      queryFn: async ({ url, formData }) => {
        try {
          const response = await axiosClient.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const { message, description, data } = response.data;
          return { data: { message, description, data } }; 
        }catch (error) {
          const status = error?.response?.status || 500;
          const message = error?.response?.data?.message || "An unexpected error occurred.";
          const description = error?.response?.data?.description || "";
          const errorData = error?.response?.data || {}; 
          return {
            error: {
              status,
              message,
              description,
              errorData: errorData,
            },
          };
        }
      },
      
      invalidatesTags: ["task"],
    }),
    updateTaskPayment: builder.mutation({
      queryFn: async ({ url, formData }) => {
        try {
          const response = await axiosClient.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const { message, description, data } = response.data;
          return { data: { message, description, data } }; 
        }catch (error) {
          const status = error?.response?.status || 500;
          const message = error?.response?.data?.message || "An unexpected error occurred.";
          const description = error?.response?.data?.description || "";
          const errorData = error?.response?.data || {}; 
          return {
            error: {
              status,
              message,
              description,
              errorData: errorData,
            },
          };
        }
      },
      
      invalidatesTags: ["task"],
    }),
    updateTaskStatus: builder.mutation({
      queryFn: async ({ url, formData }) => {
        try {
          const response = await axiosClient.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const { message, description, data } = response.data;
          return { data: { message, description, data } }; 
        }catch (error) {
          const status = error?.response?.status || 500;
          const message = error?.response?.data?.message || "An unexpected error occurred.";
          const description = error?.response?.data?.description || "";
          const errorData = error?.response?.data || {}; 
          return {
            error: {
              status,
              message,
              description,
              errorData: errorData,
            },
          };
        }
      },
      
      invalidatesTags: ["task"],
    }),

    deleteTask: builder.mutation({
      query: ({ id }) => ({
        url: `delete-task/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${globalToken}`,
        },
      }),
      invalidatesTags: ["task"],
    }),
  }),
});

export const {
  useGetTaskDataQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskPaymentMutation,
  useUpdateTaskStatusMutation,
  useGetSingleTaskDataQuery
} = taskSlice;
