import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";
import { globalToken } from "../globalToken"
import axiosClient from "../../axios-client.js";


export const incomeSlice = createApi({
    reducerPath: "income",
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
    }),
    tagTypes: ["income"],
    endpoints: (builder) => ({
        getIncomeData: builder.query({
            query: ({currentPage,pageSize,query}) => {
                return {
                    url: `/incomes?page=${currentPage}&pageSize=${pageSize}&category=${query?.category}&order=${query?.order}&limit=${query?.limit}&to_date=${query?.to_date}&from_date=${query?.from_date}&type=${query?.type}&account_id=${query?.account_id}`,
                    method: "GET",
                    headers:{
                        Authorization: `Bearer ${globalToken}`
                    }
                };
            },
            providesTags: ["income"],
        }),
        getIncomeTypesData: builder.query({
            query: () => {
                return {
                    url: `/income-types`,
                    method: "GET",
                    headers:{
                        Authorization: `Bearer ${globalToken}`
                    }
                };
            },
            providesTags: ["income"],
        }),
        createIncome: builder.mutation({
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

            invalidatesTags: ["income"],
        }),
        uploadCsv: builder.mutation({
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

            invalidatesTags: ["income"],
        }),
        deleteIncome: builder.mutation({
            query: ({id}) => ({
                url: `income/${id}`,
                method: 'DELETE',
                headers:{
                    Authorization: `Bearer ${globalToken}`
                }
            }),
            invalidatesTags: ['income'],
        }),
        getSingleIncomeData: builder.query({
            query: ({id}) => {
                if (typeof id !== "undefined"){
                    return {
                        url: `income/${id}`,
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${globalToken}`,
                        },
                    };
                }

            },
            providesTags: ["task"],
        }),
    }),
});

export const {
    useGetIncomeDataQuery,
    useGetIncomeTypesDataQuery,
    useCreateIncomeMutation,
    useUploadCsvMutation,
    useUpdateIncomeMutation,
    useDeleteIncomeMutation,
    useGetSingleIncomeDataQuery
} = incomeSlice;