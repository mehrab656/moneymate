import React, { useState } from 'react';
import axiosClient from '../../../../axios-client.js';
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function IncomeExportButton() {
    const [loading, setLoading] = useState(false);

    const handleExportCsv = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/export-income-csv');
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            const filename = `incomes-${timestamp}.csv`;
            const blob = new Blob([response.data], {type: 'text/csv'});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button className='btn primary-theme-btn btn-sm ml-2' onClick={handleExportCsv} disabled={loading}>
            <FontAwesomeIcon icon={faFileExport} />
        </button>
    );
}
