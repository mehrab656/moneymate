import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";


export const companySlice = createApi({
  reducerPath: "company",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["company"],
  endpoints: (builder) => ({
    getCompanyData: builder.query({
      query: ({token,searchValue,currentPage,pageSize}) => {
        return {
          url: `/companies?keyword=${searchValue}&page=${currentPage}&pageSize=${pageSize}`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${token}`
          }
        };
      },
      providesTags: ["company"],
    }),
  }),
});

export const {
    useGetCompanyDataQuery
  } = companySlice;