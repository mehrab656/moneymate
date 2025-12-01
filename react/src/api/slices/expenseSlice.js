import { createApi } from "@reduxjs/toolkit/query/react";
import axiosClient from "../../axios-client.js";
import { customBaseQuery } from "../../store/customBaseQuery.js";

export const expenseSlice = createApi({
  reducerPath: "expense",
  baseQuery: customBaseQuery,
  tagTypes: ["expense"],
  endpoints: (builder) => ({
    getExpenseData: builder.query({
      query: ({ currentPage, pageSize, query }) => {
        const params = new URLSearchParams();
        params.set("page", currentPage ?? 1);
        params.set("pageSize", pageSize ?? 10);
        if (query?.limit) params.set("limit", query.limit);
        if (query?.order) params.set("order", query.order);
        if (query?.orderBy) params.set("orderBy", query.orderBy);
        const sectors = (query?.sectorIDS ?? []).filter(Boolean).join(",");
        const categories = (query?.categoryIDS ?? []).filter(Boolean).join(",");
        if (sectors) params.set("sectors", sectors);
        if (categories) params.set("categories", categories);
        if (query?.start_date) params.set("start_date", query.start_date);
        if (query?.end_date) params.set("end_date", query.end_date);

        return {
          url: `/expenses?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["expense"],
    }),
    getSingleExpenseData: builder.query({
      query: ({ id }) => {
        if (typeof id !== "undefined") {
          return {
            url: `/expense/${id}`,
            method: "GET",
          };
        }
      },
      providesTags: ["expense"],
    }),
    getExpenseCategoriesData: builder.query({
      query: ({ id }) => {
        if (typeof id !== "undefined") {
          return {
            url: `/expense-categories?sector_id=${id}`,
            method: "GET",
          };
        }
      },
      providesTags: ["expense"],
    }),
    createExpense: builder.mutation({
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

      invalidatesTags: ["expense"],
    }),
    deleteExpense: builder.mutation({
      query: ({ id }) => ({
        url: `expense/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["expense"],
    }),
  }),
});

export const {
  useGetExpenseDataQuery,
  useGetExpenseCategoriesDataQuery,
  useGetSingleExpenseDataQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseSlice;
