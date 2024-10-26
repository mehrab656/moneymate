import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {baseUrl} from "../baseUrl";
import {globalToken} from "../globalToken.js";


export const sectorSlice = createApi({
    reducerPath: "sectors",
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
    }),
    tagTypes: ["sectors"],
    endpoints: (builder) => ({
        getSectorsData: builder.query({
            query: ({token, searchValue, currentPage, pageSize}) => {
                return {
                    url: `/sectors`,
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
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
    }),
});

export const {
    useGetSectorsDataQuery,
    useGetSectorListDataQuery,
} = sectorSlice;