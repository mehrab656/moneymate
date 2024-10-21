import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../baseUrl";


export const taskSlice = createApi({
  reducerPath: "task",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["task"],
  endpoints: (builder) => ({
    getTaskData: builder.query({
      query: ({
        token,
        currentPage,
        pageSize,
        query
      }) => {
        return {
          url: `all-tasks?currentPage=${currentPage}&pageSize=${pageSize}&employee_id=${query?.employee_id}&status=${query?.status}&payment_status=${query?.payment_status}&orderBy=${query?.orderBy}&order=${query?.order}&limit=${query?.limit}&category_id=${query?.category_id}&end_date=${query?.end_date}&start_date=${query?.start_date}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
      providesTags: ["task"],
    }),
    getCategorySectorListData: builder.query({
      query: ({ token }) => {
        return {
          url: `/sectors-list`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
      providesTags: ["task"],
    }),

    createCategory: builder.mutation({
      query: ({ token, formData }) => ({
        url: `category/add`,
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["task"],
    }),

    deleteCategory: builder.mutation({
      query: ({ token, id }) => ({
        url: `category/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["task"],
    }),
  }),
});

export const {
  useGetTaskDataQuery,
  useGetCategorySectorListDataQuery,

  useCreateCategoryMutation,

  useDeleteCategoryMutation,
} = taskSlice;
