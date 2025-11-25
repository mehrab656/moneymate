// src/store/customBaseQuery.js
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../api/baseUrl";

export const customBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: (headers) => {
    // Ensure API returns JSON instead of 302 redirects on validation
    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');
    // Read token directly from localStorage
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
