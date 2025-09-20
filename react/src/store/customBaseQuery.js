// src/store/customBaseQuery.js
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../api/baseUrl";

export const customBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: (headers) => {
    // Read token directly from localStorage
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
