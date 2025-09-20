import { createApi } from "@reduxjs/toolkit/query/react";
import axiosClient from "../../axios-client.js";
import { customBaseQuery } from "../../store/customBaseQuery.js";

export const investmentSlice = createApi({
  reducerPath: "investment",
  baseQuery: customBaseQuery,
  tagTypes: ["investment"],
  endpoints: (builder) => ({
    getInvestmentData: builder.query({
      query: ({ currentPage, pageSize, query }) => {
        return {
          url: `/investments?page=${currentPage}&pageSize=${pageSize}&investor_id=${query?.investor_id}&orderBy=${query?.orderBy}&order=${query?.order}&limit=${query?.limit}&to_date=${query?.to_date}&from_date=${query?.from_date}`,
          method: "GET",
        };
      },
      providesTags: ["investment"],
    }),

    createInvestment: builder.mutation({
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

      invalidatesTags: ["investment"],
    }),
    updateTaskPayment: builder.mutation({
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

      invalidatesTags: ["task"],
    }),

    deleteInvestment: builder.mutation({
      query: ({ id }) => ({
        url: `investment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["investment"],
    }),

    getSingleInvestmentData: builder.query({
      query: ({ id }) => {
        if (typeof id !== "undefined") {
          return {
            url: `investment/${id}`,
            method: "GET",
          };
        }
      },
      providesTags: ["task"],
    }),
  }),
});

export const {
  useGetInvestmentDataQuery,
  useCreateInvestmentMutation,
  useUpdateInvestmentMutation,
  useDeleteInvestmentMutation,
  useGetSingleInvestmentDataQuery,
} = investmentSlice;
