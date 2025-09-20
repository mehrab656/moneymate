import { createApi } from "@reduxjs/toolkit/query/react";

import axiosClient from "../../axios-client.js";
import { customBaseQuery } from "../../store/customBaseQuery.js";

export const assetSlice = createApi({
  reducerPath: "asset",
  baseQuery: customBaseQuery,
  tagTypes: ["asset"],
  endpoints: (builder) => ({
    getAssetData: builder.query({
      query: ({ currentPage, pageSize, query }) => {
        return {
          url: `/all-assets?page=${currentPage}&pageSize=${pageSize}&limit=${query?.limit}`,
          method: "GET",
        };
      },
      providesTags: ["asset"],
    }),
    getSingleAssetData: builder.query({
      query: ({ id }) => {
        if (typeof id !== "undefined") {
          return {
            url: `/asset/${id}`,
            method: "GET",
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
        } catch (error) {
          const status = error?.response?.status || 500;
          const message =
            error?.response?.data?.message || "An unexpected error occurred.";
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
      query: ({ id }) => ({
        url: `asset/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["asset"],
    }),
  }),
});

export const {
  useGetAssetDataQuery,
  useGetSingleAssetDataQuery,
  useCreateAssetMutation,
  useDeleteAssetMutation,
} = assetSlice;
