import { createApi } from "@reduxjs/toolkit/query/react";

import { customBaseQuery } from "../../store/customBaseQuery";

export const employeeSlice = createApi({
  reducerPath: "employee",
  baseQuery: customBaseQuery,
  tagTypes: ["employee"],
  endpoints: (builder) => ({
    getAllEmployeeData: builder.query({
      query: ({ currentPage, pageSize }) => {
        return {
          url: `/employees?page=${currentPage}&pageSize=${pageSize}`,
          method: "GET",
        };
      },
      providesTags: ["employee"],
    }),
    getEmployeeList: builder.query({
      query: () => {
        return {
          url: `/employees`,
          method: "GET",
        };
      },
      providesTags: ["employee"],
    }),
  }),
});

export const { useGetAllEmployeeDataQuery, useGetEmployeeListQuery } =
  employeeSlice;
