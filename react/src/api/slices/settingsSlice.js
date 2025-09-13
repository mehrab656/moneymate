import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";
import { globalToken } from "../globalToken"
import axiosClient from "../../axios-client.js";


export const settingsSlice = createApi({
    reducerPath: "settings",
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
    }),
    tagTypes: ["settings"],
    endpoints: (builder) => ({
        getConnectPmsData: builder.mutation({
            queryFn: async ({  formData }) => {
                try {
                    const response = await axiosClient.post("connect-host-away", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    const { message, description } = response.data;
                    return { data: { message, description } };
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
        getPmsStatusData: builder.query({
            query: ({currentPage}) => {
                return {
                    url: `getConnectionStatus`,
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${globalToken}`,
                    },
                };
            },
            providesTags: ["settings"],
        }),
        disconnectPms: builder.mutation({
            query: ({id}) => ({
                url: `income/${id}`,
                method: 'DELETE',
                headers:{
                    Authorization: `Bearer ${globalToken}`
                }
            }),
            invalidatesTags: ['income'],
        }),
    }),
});

export const {
    useGetConnectPmsDataMutation,
    useGetPmsStatusDataQuery,
} = settingsSlice;
