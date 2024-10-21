import React, { useEffect, useState} from "react";

import MainLoader from "../components/MainLoader.jsx";
export default function EmployeeDashboard() {

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        document.title = "Employee Dashboard";
    }, []);

    return (
        <>
            <MainLoader loaderVisible={loading} />
        </>
    )
}
