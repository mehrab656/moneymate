import { createApi } from "@reduxjs/toolkit/query/react";
import axiosClient from "../../axios-client.js";
import { customBaseQuery } from "../../store/customBaseQuery.js";

export const settingsSlice = createApi({
  reducerPath: "settings",
  baseQuery: customBaseQuery,
  tagTypes: ["settings"],
  endpoints: (builder) => ({
    getConnectPmsData: builder.mutation({
      queryFn: async ({ formData }) => {
        try {
          const response = await axiosClient.post(
            "connect-host-away",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          const { message, description } = response.data;
          return { data: { message, description } };
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

      invalidatesTags: ["income"],
    }),
    getPmsStatusData: builder.query({
      query: ({ currentPage }) => {
        return {
          url: `getConnectionStatus`,
          method: "GET",
        };
      },
      providesTags: ["settings"],
    }),
    disconnectPms: builder.mutation({
      query: ({ id }) => ({
        url: `income/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["income"],
    }),
  }),
});

export const { useGetConnectPmsDataMutation, useGetPmsStatusDataQuery } =
  settingsSlice;
