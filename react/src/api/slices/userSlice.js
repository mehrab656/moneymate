import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {baseUrl} from "../baseUrl";
import {globalToken} from "../globalToken.js";


export const userSlice = createApi({
    reducerPath: "users",
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
    }),
    tagTypes: ["users"],
    endpoints: (builder) => ({
        getUserData: builder.query({
            query: ({token}) => {
                return {
                    url: `/user`,
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
            },
            providesTags: ["users"],
        }),
        getInvestorData: builder.query({
            query: ({
                        currentPage,
                        pageSize,
                        query
                    }) => {
                return {
                    url: `/get-investors`,
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${globalToken}`
                    }
                };
            },
            providesTags: ['users']
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
    }),
});

export const {
    useGetUserDataQuery,
    useGetInvestorDataQuery
} = userSlice;