import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";


export const accountSlice = createApi({
  reducerPath: "accounts",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["accounts"],
  endpoints: (builder) => ({
    getFinancialReportData: builder.query({
      query: ({token}) => {
        return {
          url: `/getFinanceReport`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${token}`
          }
        };
      },
      providesTags: ["accounts"],
    }),
  }),
});

export const {
 useGetFinancialReportDataQuery
  } = accountSlice;