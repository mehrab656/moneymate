import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";
import { globalToken } from "../globalToken"
import axiosClient from "../../axios-client.js";


export const companySlice = createApi({
  reducerPath: "company",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["company"],
  endpoints: (builder) => ({
    getCompanyData: builder.query({
      query: ({currentPage,pageSize, query}) => {
        return {
          url: `/companies?page=${currentPage}&pageSize=${pageSize}&limit=${query?.limit}`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${globalToken}`
          }
        };
      },
      providesTags: ["company"],
    }),
    getSingleCompanyData: builder.query({
      query: ({id}) => {
        if (typeof id !== "undefined"){
          return {
            url: `/company/${id}`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${globalToken}`,
            },
          };
        }

      },
      providesTags: ["company"],
    }),
    createCompany: builder.mutation({
      queryFn: async ({ url, formData }) => {
          try {
              const response = await axiosClient.post(url, formData, {
                  headers: { "Content-Type": "multipart/form-data" },
              });
              const { message, description, data } = response.data;
              return { data: { message, description, data } };
          }catch (error) {
              const status = error?.response?.status || 500;
              const message = error?.response?.data?.message || "An unexpected error occurred.";
              const description = error?.response?.data?.description || "";
              const errorData = error?.response?.data || {};
              return {
                  error: {
                      status,
                      message,
                      description,
                      errorData: errorData,
                  },
              };
          }
      },

      invalidatesTags: ["company"],
  }),
    deleteCompany: builder.mutation({
      query: ({id}) => ({
          url: `/company/${id}`,
          method: 'DELETE',
          headers:{
              Authorization: `Bearer ${globalToken}`
          }
      }),
      invalidatesTags: ['company'],
  })
  }),
});

export const {
    useGetCompanyDataQuery,
    useGetSingleCompanyDataQuery,
    useCreateCompanyMutation,
    useDeleteCompanyMutation
  } = companySlice;