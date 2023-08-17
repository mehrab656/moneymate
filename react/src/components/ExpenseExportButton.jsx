import React, {useState} from "react";
import axiosClient from "../axios-client.js";

export default function ExpenseExportButton() {
    const [loading, setLoading] = useState(false);

    const handleExportCsv = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/export-expense-csv');
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            const filename = `expense-${timestamp}.csv`;
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
        <div>
            <button className='btn-info' onClick={handleExportCsv} disabled={loading}>
                {loading ? 'Exporting...' : 'Export Expense Data'}
            </button>
        </div>
    );
}
