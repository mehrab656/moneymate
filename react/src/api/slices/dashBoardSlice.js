import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../baseUrl";
import { globalToken } from "../globalToken"


export const dashboardSlice = createApi({
  reducerPath: "dashboard",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["dashboard"],
  endpoints: (builder) => ({
    getDashboardData: builder.query({
      query: () => {
        return {
          url: `/dashboard-data`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${globalToken}`,
          },
        };
      },
      providesTags: ["dashboard"],
    }),
    getExpenseGraphData: builder.query({
      query: () => {
        return {
          url: `/expenses/graph`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${globalToken}`,
          },
        };
      },
      providesTags: ["dashboard"],
    }),
    getBudgetPieData: builder.query({
      query: () => {
        return {
          url: `/budget/pie-data`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${globalToken}`,
          },
        };
      },
      providesTags: ["dashboard"],
    }),
    getSideBarCompanyListsData: builder.query({
      query: () => {
        return {
          url: `companies`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${globalToken}`
          }
        };
      },
      providesTags: ["dashboard"],
    }),
    getCurrentCompanyData: builder.query({
      query: ({id}) => {
        return {
          url: `/getCurrentCompany/${id}`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${globalToken}`
          }
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
  useGetCurrentCompanyDataQuery
} = dashboardSlice;
