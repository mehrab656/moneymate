import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";


export const categorySlice = createApi({
  reducerPath: "category",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["category"],
  endpoints: (builder) => ({
    getCategoryData: builder.query({
      query: ({token,searchValue,currentPage,pageSize,selectedSectorId,categoryType}) => {
        return {
          url: `/categories?keyword=${searchValue}&page=${currentPage}&pageSize=${pageSize}&selectedSectorId=${selectedSectorId}&categoryType=${categoryType}`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${token}`
          }
        };
      },
      providesTags: ["category"],
    }),
    getCategorySectorListData: builder.query({
      query: ({token}) => {
        return {
          url: `/sectors-list`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${token}`
          }
        };
      },
      providesTags: ["category"],
    }),

    createCategory: builder.mutation({
      query: ({token,formData}) => ({
        url: `category/add`,
        method: 'POST',
        body: formData,
        headers:{
          Authorization: `Bearer ${token}`
        }
      }),
      invalidatesTags: ['category'],
    }),


    deleteCategory: builder.mutation({
      query: ({token,id}) => ({
        url: `category/${id}`,
        method: 'DELETE',
        headers:{
          Authorization: `Bearer ${token}`
        }
      }),
      invalidatesTags: ['category'],
    }),



  }),
});

export const {
 useGetCategoryDataQuery,
 useGetCategorySectorListDataQuery,

 useCreateCategoryMutation,

 useDeleteCategoryMutation
  } = categorySlice;