import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../store/customBaseQuery";

export const categorySlice = createApi({
  reducerPath: "category",
  baseQuery: customBaseQuery,
  tagTypes: ["category"],
  endpoints: (builder) => ({
    getCategoryData: builder.query({
      query: ({ currentPage, pageSize, query }) => {
        return {
          url: `/categories?page=${currentPage}&pageSize=${pageSize}&selectedSectorId=${query?.selectedSectorId}&categoryType=${query?.type}`,
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
      query: ({ token, formData }) => ({
        url: `category/add`,
        method: "POST",
        body: formData,
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
  }),
});

export const {
  useGetCategoryDataQuery,
  useGetCategorySectorListDataQuery,
  useGetCategoryListDataQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} = categorySlice;
