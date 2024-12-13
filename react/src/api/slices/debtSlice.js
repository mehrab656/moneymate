import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";
import { globalToken } from "../globalToken"
import axiosClient from "../../axios-client.js";


export const debtSlice = createApi({
    reducerPath: "debt",
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
    }),
    tagTypes: ["debt"],
    endpoints: (builder) => ({
        getDebtData: builder.query({
            query: ({currentPage,pageSize}) => {
                return {
                    url: `/debts?page=${currentPage}&pageSize=${pageSize}`,
                    method: "GET",
                    headers:{
                        Authorization: `Bearer ${globalToken}`
                    }
                };
            },
            providesTags: ["employee"],
        }),
        createDebt: builder.mutation({
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

            invalidatesTags: ["company"],
        }),
        deleteDebt: builder.mutation({
            query: ({id}) => ({
                url: `/debts/delete/${id}`,
                method: 'DELETE',
                headers:{
                    Authorization: `Bearer ${globalToken}`
                }
            }),
            invalidatesTags: ['company'],
        })
    }),
});

export const {
    useGetDebtDataQuery,
    useCreateDebtMutation,
    useDeleteDebtMutation,
} = debtSlice;