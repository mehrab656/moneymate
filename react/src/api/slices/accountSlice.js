import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../store/customBaseQuery";

export const accountSlice = createApi({
  reducerPath: "accounts",
  baseQuery: customBaseQuery,
  tagTypes: ["accounts"],
  endpoints: (builder) => ({
    getFinancialReportData: builder.query({
      query: () => {
        return {
          url: `/getFinanceReport`,
          method: "GET",
        };
      },
      providesTags: ["accounts"],
    }),
  }),
});

export const { useGetFinancialReportDataQuery } = accountSlice;
