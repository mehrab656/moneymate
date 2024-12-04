import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseUrl } from "../baseUrl";
import { globalToken } from "../globalToken"
import axiosClient from "../../axios-client.js";


export const assetSlice = createApi({
  reducerPath: "asset",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["asset"],
  endpoints: (builder) => ({
    getAssetData: builder.query({
      query: ({currentPage,pageSize, query}) => {
        return {
          url: `/all-assets?page=${currentPage}&pageSize=${pageSize}&limit=${query?.limit}`,
          method: "GET",
          headers:{
            Authorization: `Bearer ${globalToken}`
          }
        };
      },
      providesTags: ["asset"],
    }),
    getSingleAssetData: builder.query({
      query: ({id}) => {
        if (typeof id !== "undefined"){
          return {
            url: `/asset/${id}`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${globalToken}`,
            },
          };
        }

      },
      providesTags: ["asset"],
    }),
    createAsset: builder.mutation({
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

      invalidatesTags: ["asset"],
  }),
    deleteAsset: builder.mutation({
      query: ({id}) => ({
          url: `asset/${id}`,
          method: 'DELETE',
          headers:{
              Authorization: `Bearer ${globalToken}`
          }
      }),
      invalidatesTags: ['asset'],
  })
  }),
});

export const {
    useGetAssetDataQuery,
    useGetSingleAssetDataQuery,
    useCreateAssetMutation,
    useDeleteAssetMutation
  } = assetSlice;