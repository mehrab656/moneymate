import React, {useEffect, useState} from 'react';
import axiosClient from '../axios-client.js';
import {Pie} from 'react-chartjs-2';

export default function MonthlyExpenseChart({title}) {
    const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchExpenseData = () => {
        axiosClient
            .get('/expenses/graph')
            .then(({data}) => {
                const coloredData = data.labels.map((label, index) => ({
                    label: label,
                    value: data.data[index],
                    backgroundColor: getRandomColor(),
                }));
                setExpenseData(coloredData);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchExpenseData();
    }, []);

    const getRandomColor = () => {
         // Generate a random hexadecimal color code
        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    };

    const sortedExpenseData = [...expenseData].sort((a, b) => b.value - a.value);

    const chartData = {
        labels: sortedExpenseData.map((data) => data.label),
        datasets: [
            {
                data: sortedExpenseData.map((data) => data.value),
                backgroundColor: sortedExpenseData.map((data) => data.backgroundColor),
            },
        ],
    };

    return (
        <div style={{width: '100%'}}>
            <h1 className="title-text mb-0 text-center">{title}</h1>
            <br/>
            {loading ? (
                <p className="text-center">Loading...</p>
            ) : sortedExpenseData.length > 0 ? (
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <div style={{width: '80%', maxWidth: '400px'}}>
                        <Pie
                            data={chartData}
                            options={{
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            boxWidth: 10,
                                            usePointStyle: true,
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            ) : (
                <p className="text-center">No data available</p>
            )}

        </div>
    );
}
