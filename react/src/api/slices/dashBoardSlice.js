import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../store/customBaseQuery";

export const dashboardSlice = createApi({
  reducerPath: "dashboard",
  baseQuery: customBaseQuery,
  tagTypes: ["dashboard"],
  endpoints: (builder) => ({
    getDashboardData: builder.query({
      query: () => {
        return {
          url: `/dashboard-data`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
    getExpenseGraphData: builder.query({
      query: () => {
        return {
          url: `/expenses/graph`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
    getBudgetPieData: builder.query({
      query: () => {
        return {
          url: `/budget/pie-data`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
    getSideBarCompanyListsData: builder.query({
      query: () => {
        return {
          url: `companies`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
    getCurrentCompanyData: builder.query({
      query: ({ id }) => {
        return {
          url: `/getCurrentCompany/${id}`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetExpenseGraphDataQuery,
  useGetBudgetPieDataQuery,
  useGetSideBarCompanyListsDataQuery,
  useGetCurrentCompanyDataQuery,
} = dashboardSlice;
