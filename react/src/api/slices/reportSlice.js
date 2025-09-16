import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../store/customBaseQuery";

export const reportSlice = createApi({
  reducerPath: "report",
  baseQuery: customBaseQuery,
  tagTypes: ["report"],
  endpoints: (builder) => ({
    getExpenseReportData: builder.query({
      query: ({ query }) => {
        return {
          url: `/report/expense?startDate${query?.start_date}&endDate=${query?.end_date}&categoryIDS=${query?.categoryIDS}&orderBy=${query?.orderBy}&order=${query?.order}&limit=${query?.limit}&sectorIDS=${query?.sectorIDS}&quickFilter=${query?.quickFilterSectorID}`,
          method: "GET",
        };
      },
      providesTags: ["report"],
    }),
  }),
});

export const { useGetExpenseReportDataQuery } = reportSlice;
