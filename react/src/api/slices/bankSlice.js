import { createApi } from "@reduxjs/toolkit/query/react";
import axiosClient from "../../axios-client";
import { customBaseQuery } from "../../store/customBaseQuery";

export const bankSlice = createApi({
  reducerPath: "bank",
  baseQuery: customBaseQuery,
  tagTypes: ["bank"],
  endpoints: (builder) => ({
    getBankData: builder.query({
      query: ({ currentPage, pageSize, query }) => {
        return {
          url: `all-bank-account?currentPage=${currentPage}&pageSize=${pageSize}&employee_id=${query?.employee_id}&status=${query?.status}&payment_status=${query?.payment_status}&orderBy=${query?.orderBy}&order=${query?.order}&limit=${query?.limit}&category_id=${query?.category_id}&end_date=${query?.end_date}&start_date=${query?.start_date}`,
          method: "GET",
        };
      },
      providesTags: ["bank"],
    }),
    getSingleBankData: builder.query({
      query: ({ currentPage, pageSize, query }) => {
        return {
          url: `all-tasks?currentPage=${currentPage}&pageSize=${pageSize}&employee_id=${query?.employee_id}&status=${query?.status}&payment_status=${query?.payment_status}&orderBy=${query?.orderBy}&order=${query?.order}&limit=${query?.limit}&category_id=${query?.category_id}&end_date=${query?.end_date}&start_date=${query?.start_date}`,
          method: "GET",
        };
      },
      providesTags: ["bank"],
    }),
    createBank: builder.mutation({
      queryFn: async ({ url, formData }) => {
        try {
          const response = await axiosClient.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const { message, description, data } = response.data;
          return { data: { message, description, data } };
        } catch (error) {
          const status = error?.response?.status || 500;
          const message =
            error?.response?.data?.message || "An unexpected error occurred.";
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

      invalidatesTags: ["bank"],
    }),
    updateBank: builder.mutation({
      queryFn: async ({ url, formData }) => {
        try {
          const response = await axiosClient.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const { message, description, data } = response.data;
          return { data: { message, description, data } };
        } catch (error) {
          const status = error?.response?.status || 500;
          const message =
            error?.response?.data?.message || "An unexpected error occurred.";
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

      invalidatesTags: ["bank"],
    }),
    deleteBank: builder.mutation({
      query: ({ id }) => ({
        url: `delete-task/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["bank"],
    }),
    getAccountData: builder.query({
      query: ({ id }) => {
        if (typeof id !== "undefined") {
          return {
            url: `all-bank-account?currentPage=${currentPage}&pageSize=${pageSize}&employee_id=${query?.employee_id}&status=${query?.status}&payment_status=${query?.payment_status}&orderBy=${query?.orderBy}&order=${query?.order}&limit=${query?.limit}&category_id=${query?.category_id}&end_date=${query?.end_date}&start_date=${query?.start_date}`,
            method: "GET",
          };
        }
      },
      providesTags: ["bank"],
    }),
    getSingleAccountData: builder.query({
      query: ({ id }) => {
        if (typeof id !== "undefined") {
          return {
            url: `task/${id}`,
            method: "GET",
          };
        }
      },
      providesTags: ["bank"],
    }),
    createAccount: builder.mutation({
      queryFn: async ({ url, formData }) => {
        try {
          const response = await axiosClient.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const { message, description, data } = response.data;
          return { data: { message, description, data } };
        } catch (error) {
          const status = error?.response?.status || 500;
          const message =
            error?.response?.data?.message || "An unexpected error occurred.";
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

      invalidatesTags: ["bank"],
    }),
    updateAccount: builder.mutation({
      queryFn: async ({ url, formData }) => {
        try {
          const response = await axiosClient.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const { message, description, data } = response.data;
          return { data: { message, description, data } };
        } catch (error) {
          const status = error?.response?.status || 500;
          const message =
            error?.response?.data?.message || "An unexpected error occurred.";
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

      invalidatesTags: ["bank"],
    }),
    deleteAccount: builder.mutation({
      query: ({ id }) => ({
        url: `delete-task/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["bank"],
    }),
  }),
});

export const {
  useGetBankDataQuery,
  useGetSingleBankDataQuery,
  useCreateBankMutation,
  useCreateAccountMutation,
  useDeleteBankMutation,
  useDeleteAccountMutation,
  useUpdateBankMutation,
  useUpdateAccountMutation,
  useGetSingleAccountDataQuery,
} = bankSlice;
