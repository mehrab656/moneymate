import { createApi } from "@reduxjs/toolkit/query/react";
import axiosClient from "../../axios-client";
import { customBaseQuery } from "../../store/customBaseQuery.js";

export const userSlice = createApi({
  reducerPath: "users",
  baseQuery: customBaseQuery,
  tagTypes: ["users"],
  endpoints: (builder) => ({
    getUserData: builder.query({
      query: ({ token }) => {
        return {
          url: `/user`,
          method: "GET",
        };
      },
      providesTags: ["users"],
    }),
    getInvestorData: builder.query({
      query: ({ currentPage, pageSize, query }) => {
        return {
          url: `/get-investors`,
          method: "GET",
        };
      },
      providesTags: ["users"],
    }),
    // getSingleGroupData: builder.query({
    //   query: ({token,uuid}) => {
    //     if(token && uuid){
    //       return {
    //         url: `/api/community/groups/${uuid}`,
    //         method: "GET",
    //         headers:{
    //           Authorization: `Bearer ${token}`
    //         }
    //       };
    //     }
    //   },
    //   providesTags: ["users"],
    // }),
    // storeGroup: builder.mutation({
    //   query: ({token,formData,url}) => ({
    //     url: url,
    //     method: 'POST',
    //     body: formData,
    //     headers:{
    //       Authorization: `Bearer ${token}`
    //     }
    //   }),
    //   invalidatesTags: ['users'],
    // }),

    // deleteGroup: builder.mutation({
    //   query: ({token,uuid}) => ({
    //     url: `/api/community/groups/${uuid}`,
    //     method: 'DELETE',
    //     headers:{
    //       Authorization: `Bearer ${token}`
    //     }
    //   }),
    //   invalidatesTags: ['users'],
    // }),

    createUser: builder.mutation({
      queryFn: async ({ formData }) => {
        try {
          const response = await axiosClient.post("/users", formData, {
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

      invalidatesTags: ["user"],
    }),
    updateUser: builder.mutation({
      queryFn: async ({ slug, formData }) => {
        try {
          const response = await axiosClient.post(`/users/${slug}`, formData, {
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

      invalidatesTags: ["user"],
    }),
    updateBasicInfo: builder.mutation({
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

      invalidatesTags: ["user"],
    }),
    updateEmploymentInfo: builder.mutation({
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

      invalidatesTags: ["user"],
    }),
    updateSecurityInfo: builder.mutation({
      query: (data) => ({
        url: "/update-security",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),
  }),
});

export const {
  useGetUserDataQuery,
  useGetInvestorDataQuery,
  useCreateUserMutation,
  useDeleteuserMutation,
  useUpdateUserMutation,
  useGetSingleUserDataQuery,
  useUpdateBasicInfoMutation,
  useUpdateEmploymentInfoMutation,
  useUpdateSecurityInfoMutation
} = userSlice;
