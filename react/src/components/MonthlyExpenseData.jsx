import React, {useEffect, useState} from 'react';
import axiosClient from '../axios-client.js';

export default function MonthlyExpenseData() {
    const [expenseData, setExpenseData] = useState([]);

    const fetchExpenseData = () => {
        axiosClient
            .get('/expenses/graph')
            .then(({data}) => {
                setExpenseData(data);
            })
            .catch((error) => {
                console.warn('Unable to fetch expense data:' + error);
            });
    };

    useEffect(() => {
        fetchExpenseData();
    }, []);

    return (
        <div>
            <h2 className={'text-center'}>Total Expense By Category this month -- This will be replaced by graph</h2>
            <br/><br/>
            <table className={'table-bordered table-striped'}>
                <thead>
                <tr className={'text-center'}>
                    <th>Category</th>
                    <th>Cost</th>
                </tr>
                </thead>
                <tbody>
                {expenseData.labels &&
                    expenseData.labels.map((label, index) => (
                        <tr className={'text-center'} key={index}>
                            <td>{label}</td>
                            <td>{expenseData.data[index]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
