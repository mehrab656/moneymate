import React, {useEffect, useState} from 'react';
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js';
import axiosClient from '../../axios-client.js';
import {Doughnut} from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetExpensesChart = ({title, getBudgetPieData, loading}) => {
    const [chartData, setChartData] = useState(null);

    const generateData = (data) =>{
            const labels = data.map((category) => category.name);
            const amounts = data.map((category) => category.spent_amount);
            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: '',
                        data: amounts,
                        backgroundColor: [
                            'rgba(243, 92, 102, 0.8)', // Red
                            'rgba(61, 136, 198, 0.8)', // Blue
                            'rgba(249, 156, 71, 0.8)', // Orange
                            'rgba(106, 191, 141, 0.8)', // Green
                            'rgba(150, 122, 195, 0.8)', // Purple
                            'rgba(250, 127, 81, 0.8)', // Orange
                        ],
                        borderColor: [
                            'rgba(243, 92, 102, 1)', // Red
                            'rgba(61, 136, 198, 1)', // Blue
                            'rgba(249, 156, 71, 1)', // Orange
                            'rgba(106, 191, 141, 1)', // Green
                            'rgba(150, 122, 195, 1)', // Purple
                            'rgba(250, 127, 81, 1)', // Orange
                        ],
                        borderWidth: 2,
                    },
                ],
            });
    }

    useEffect(() => {
       if(getBudgetPieData && getBudgetPieData?.length>0){
        generateData(getBudgetPieData)
       }
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        // Modify other chart options here if needed
    };

    const message = getBudgetPieData?.error ?getBudgetPieData?.error : 'No data available'

    return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{width: '100%', textAlign: 'center'}}>
                <h1 className="title-text mb-0">{title}</h1>
                <br/>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <div style={{width: '45%', textAlign: 'center'}}>
                        {loading ? (
                            <p>Loading...</p>
                        ) : chartData ? (
                            <Doughnut data={chartData} options={chartOptions} width={200} height={200}/>
                        ) :(
                          <p>{message}</p>  
                        ) 
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetExpensesChart;
