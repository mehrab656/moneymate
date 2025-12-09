import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../store/customBaseQuery";

export const categorySlice = createApi({
  reducerPath: "category",
  baseQuery: customBaseQuery,
  tagTypes: ["category"],
  endpoints: (builder) => ({
    getCategoryData: builder.query({
      query: ({ currentPage, pageSize, query, companyId }) => {
        return {
          url: `/categories?page=${currentPage}&pageSize=${pageSize}&selectedSectorId=${query?.selectedSectorId}&categoryType=${query?.type}&company_id=${companyId ?? ""}`,
          method: "GET",
        };
      },
      providesTags: ["category"],
    }),
    getCategorySectorListData: builder.query({
      query: () => {
        return {
          url: `/sectors-list`,
          method: "GET",
        };
      },
      providesTags: ["category"],
    }),
    getCategoryListData: builder.query({
      query: ({ categoryType }) => {
        return {
          url: `/category?type=${categoryType}`,
          method: "GET",
        };
      },
      providesTags: ["sectors"],
    }),
    createCategory: builder.mutation({
      query: ({ data }) => ({
        url: `category/add`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["category"],
    }),
    deleteCategory: builder.mutation({
      query: ({ token, id }) => ({
        url: `category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["category"],
    }),
    getSingleCategoryData: builder.query({
      query: ({ id, token }) => ({
        url: `category/${id}`,
        method: "GET",
      }),
      providesTags: ["category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["category"],
    }),
  }),
});

export const {
  useGetCategoryDataQuery,
  useGetCategorySectorListDataQuery,
  useGetCategoryListDataQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetSingleCategoryDataQuery,
  useUpdateCategoryMutation,
} = categorySlice;
