import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";
import { globalToken } from "../globalToken"


export const employeeSlice = createApi({
  reducerPath: "employee",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["employee"],
  endpoints: (builder) => ({
    getAllEmployeeData: builder.query({
      query: ({currentPage,pageSize}) => {
        return {
          url: `/employees?page=${currentPage}&pageSize=${pageSize}`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${globalToken}`
          }
        };
      },
      providesTags: ["employee"],
    }),
    getEmployeeList: builder.query({
      query: () => {
        return {
          url: `/employees`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${globalToken}`
          }
        };
      },
      providesTags: ["employee"],
    }),
  }),
});

export const {
 useGetAllEmployeeDataQuery,
 useGetEmployeeListDataQuery,
  } = employeeSlice;