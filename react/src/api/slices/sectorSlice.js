import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";


export const sectorSlice = createApi({
  reducerPath: "sectors",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["sectors"],
  endpoints: (builder) => ({
    getSectorsData: builder.query({
      query: ({token,searchValue,currentPage,pageSize}) => {
        return {
          url: `/sectors`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${token}`
          }
        };
      },
      providesTags: ["sectors"],
    }),
  }),
});

export const {
 useGetSectorsDataQuery
  } = sectorSlice;