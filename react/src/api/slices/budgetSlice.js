import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../store/customBaseQuery";

export const budgetSlice = createApi({
  reducerPath: "budget",
  baseQuery: customBaseQuery,
  tagTypes: ["budget"],
  endpoints: (builder) => ({
    getBudgetData: builder.query({
      query: ({ currentPage, pageSize }) => {
        return {
          url: `/budgets?page=${currentPage}&pageSize=${pageSize}`,
          method: "GET",
        };
      },
      providesTags: ["budget"],
    }),
    getSingleBudgetData: builder.query({
      query: ({ id, token }) => ({
        url: `budgets/${id}`,
        method: "GET",
      }),
      providesTags: ["budget"],
    }),
    createBudget: builder.mutation({
      query: ({ token, formData }) => ({
        url: `budgets`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["budget"],
    }),
    updateBudget: builder.mutation({
      query: ({ id, token, formData }) => ({
        url: `budgets/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["budget"],
    }),
    deleteBudget: builder.mutation({
      query: ({ token, id }) => ({
        url: `budgets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["budget"],
    }),
    getBudgetCategories: builder.query({
      query: ({ id, token }) => ({
        url: `budgets/${id}/categories`,
        method: "GET",
      }),
      providesTags: ["budget"],
    }),
    getBudgetPieData: builder.query({
      query: ({ token }) => ({
        url: `budget/pie-data`,
        method: "GET",
      }),
      providesTags: ["budget"],
    }),
  }),
});

export const {
  useGetBudgetDataQuery,
  useGetSingleBudgetDataQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  useGetBudgetCategoriesQuery,
  useGetBudgetPieDataQuery,
} = budgetSlice;