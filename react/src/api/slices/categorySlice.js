import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";
import { globalToken } from "../globalToken"


export const categorySlice = createApi({
  reducerPath: "category",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["category"],
  endpoints: (builder) => ({
    getCategoryData: builder.query({
      query: ({currentPage,pageSize,query}) => {
        return {
          url: `/categories?page=${currentPage}&pageSize=${pageSize}&selectedSectorId=${query?.selectedSectorId}&categoryType=${query?.type}`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${globalToken}`
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