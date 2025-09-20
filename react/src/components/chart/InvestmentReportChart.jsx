import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function InvestmentReportChart({
  totalInvestment = 1, // default to prevent division by 0
  investors = [],
  title,
  checkLoading = false,
}) {
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(checkLoading);

  const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const fetchExpenseData = () => {
    setLoading(true);

    const coloredData = investors
      .filter(inv => inv.name && inv.amount != null) // only valid data
      .map((investor) => {
        const value = Math.ceil(
          ((parseFloat(investor.amount) || 0) / totalInvestment) * 100
        );
        return {
          label: investor.name,
          value,
          backgroundColor: getRandomColor(),
        };
      });

    setExpenseData(coloredData);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenseData();
  }, [totalInvestment, investors]); // include investors

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
    <div style={{ width: "100%" }}>
      <h1 className="title-text mb-0 text-center">{title}</h1>
      <br />
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : sortedExpenseData.length > 0 ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: "80%", maxWidth: "400px" }}>
            <Pie
              key={JSON.stringify(chartData)}
              data={chartData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { boxWidth: 10, usePointStyle: true },
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
