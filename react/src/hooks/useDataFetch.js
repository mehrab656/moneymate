import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

export default function useDataFetch(token, setUser, setToken, setUserRole, navigate) {
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axiosClient.get("companies").then(({ data }) => {
      setCompanies(data.data || []);
    });

    const currentCompanyID = localStorage.getItem("CURRENT_COMPANY");
    if (currentCompanyID) {
      axiosClient.get(`/getCurrentCompany/${currentCompanyID}`).then(({ data }) => {
        if (data.status === "success") setCurrentCompany(data.data);
      });
    }
  }, [token, navigate]);

  const switchCompany = id => {
    axiosClient.post(`/switch-company/${id}`).then(({ data }) => {
      if (data.status === "success") {
        setCurrentCompany(data.data);
        localStorage.setItem("CURRENT_COMPANY", id);
        window.location.reload();
      }
    });
  };

  return [companies, currentCompany, switchCompany];
}