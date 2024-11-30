import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {baseUrl} from "../baseUrl";
import {globalToken} from "../globalToken.js";
import axiosClient from "../../axios-client.js";


export const sectorSlice = createApi({
    reducerPath: "sectors",
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
    }),
    tagTypes: ["sectors"],
    endpoints: (builder) => ({
        getSectorsData: builder.query({
            query: ({currentPage,pageSize,query}) => {
                return {
                    url: `/sectors?currentPage=${currentPage}&pageSize=${pageSize}&account_id=${query?.payment_account_id}&contract_start_date=${query?.contract_start_date}&contract_end_date=${query?.contract_end_date}&orderBy=${query?.orderBy}&order=${query?.order}&limit=${query?.limit}`,
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${globalToken}`
                    }
                };
            },
            providesTags: ["sectors"],
        }),
        getSectorListData: builder.query({
            query: () => {
                return {
                    url: `/sectors-list`,
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${globalToken}`
                    }
                };
            },
            providesTags: ["sectors"],
        }),
        getIncomeAndExpense: builder.query({
            query: ({id}) => {
                if (typeof id !== "undefined"){
                    return {
                        url: `/sectorsIncomeExpense/${id}`,
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${globalToken}`,
                        },
                    };
                }

            },
            providesTags: ["sector"],
        }),
        getSingleSectorData: builder.query({
            query: ({id}) => {
                if (typeof id !== "undefined"){
                    return {
                        url: `sector/${id}`,
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${globalToken}`,
                        },
                    };
                }

            },
            providesTags: ["sector"],
        }),
        deleteSector: builder.mutation({
            query: ({id}) => ({
                url: `sector/${id}`,
                method: 'DELETE',
                headers:{
                    Authorization: `Bearer ${globalToken}`
                }
            }),
            invalidatesTags: ['sector'],
        }),
        createSector: builder.mutation({
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

            invalidatesTags: ["sector"],
        }),
        updateContract: builder.mutation({
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

            invalidatesTags: ["sector"],
        }),
        changePaymentStatus: builder.mutation({
            queryFn: async ({ paymentID }) => {
                try {
                    const response = await axiosClient.post(`/change-payment-status/${paymentID}`, {
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

            invalidatesTags: ["sector"],
        }),

    }),
});

export const {
    useGetSectorsDataQuery,
    useGetSectorListDataQuery,
    useGetIncomeAndExpenseQuery,
    useGetSingleSectorData,
    useDeleteSectorMutation,
    useCreateSectorMutation,
    useUpdateContractMutation,
    useChangePaymentMutation
} = sectorSlice;