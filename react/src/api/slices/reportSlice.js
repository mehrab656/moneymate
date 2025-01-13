import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {baseUrl} from "../baseUrl";
import {globalToken} from "../globalToken"
import axiosClient from "../../axios-client";


export const reportSlice = createApi({
    reducerPath: "report",
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
    }),
    tagTypes: ["report"],
    endpoints: (builder) => ({
        getExpenseReportData: builder.query({
            query: ({ query}) => {
                return {
                    url: `/report/expense?startDate${query?.start_date}&endDate=${query?.end_date}&categoryIDS=${query?.categoryIDS}&orderBy=${query?.orderBy}&order=${query?.order}&limit=${query?.limit}&sectorIDS=${query?.sectorIDS}&quickFilter=${query?.quickFilterSectorID}`,
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${globalToken}`,
                    },
                };
            },
            providesTags: ["report"],
        }),
    }),
});

export const {
    useGetExpenseReportDataQuery,
} = reportSlice;
