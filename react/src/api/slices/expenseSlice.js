import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";
import { globalToken } from "../globalToken"
import axiosClient from "../../axios-client.js";


export const expenseSlice = createApi({
    reducerPath: "expense",
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
    }),
    tagTypes: ["expense"],
    endpoints: (builder) => ({
        getExpenseData: builder.query({
            query: ({currentPage,pageSize,query}) => {
                const sectors=query.sectorIDS.toString();
                const categories=query.categoryIDS.toString();

                return {
                    url: `/expenses?page=${currentPage}&pageSize=${pageSize}&limit=${query?.limit}&order=${query?.order}&orderBy=${query?.orderBy}&sectors=${sectors}&categories=${categories}&start_date=${query?.start_date}&end_date=${query?.end_date}`,
                    method: "GET",
                    headers:{
                        Authorization: `Bearer ${globalToken}`
                    }
                };
            },
            providesTags: ["expense"],
        }),
        getSingleExpenseData: builder.query({
            query: ({id}) => {
              if (typeof id !== "undefined"){
                return {
                  url: `/expense/${id}`,
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${globalToken}`,
                  },
                };
              }
      
            },
            providesTags: ["expense"],
          }),
        getExpenseCategoriesData: builder.query({
            query: ({id}) => {
              if (typeof id !== "undefined"){
                return {
                  url: `/expense-categories?sector_id=${id}`,
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${globalToken}`,
                  },
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

            invalidatesTags: ["expense"],
        }),
        deleteExpense: builder.mutation({
            query: ({id}) => ({
                url: `expense/${id}`,
                method: 'DELETE',
                headers:{
                    Authorization: `Bearer ${globalToken}`
                }
            }),
            invalidatesTags: ['expense'],
        })
    }),
});

export const {
    useGetExpenseDataQuery,
    useGetExpenseCategoriesDataQuery,
    useGetSingleExpenseDataQuery,
    useCreateExpenseMutation,
    useDeleteExpenseMutation
} = expenseSlice;