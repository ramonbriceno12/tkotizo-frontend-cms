'use client';

import { useState, useEffect } from "react";
import BarChart from "./components/dashboard/BarChart";
import DoughnutChart from "./components/dashboard/DoughnutChart";
import LineChart from "./components/dashboard/LineChart";
import PieChart from "./components/dashboard/PieChart";

const Dashboard = () => {

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  // State for charts
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Invoices',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  });

  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Revenue',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  });

  const pieChartData = {
    labels: ['Client A', 'Client B', 'Client C'],
    datasets: [
      {
        label: 'Clients',
        data: [300, 50, 100],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Product A', 'Product B', 'Product C'],
    datasets: [
      {
        label: 'Product Sales',
        data: [200, 150, 100],
        backgroundColor: [
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
        ],
      },
    ],
  };

  // Fetch the invoice stats for the bar chart
  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/invoices/bar-chart');
        const data = await response.json();

        // Set the fetched data into the bar chart state
        setBarChartData({
          labels: data.labels,
          datasets: [
            {
              label: 'Invoices',
              data: data.datasets[0].data,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching bar chart data:", error);
      }
    };

    const fetchRevenueData = async () => {
      const response = await fetch('http://localhost:5000/api/invoices/line-chart');
      const data = await response.json();

      // Set the fetched data into the line chart state
      setLineChartData({
        labels: data.labels,
        datasets: [
          {
            label: 'Revenue',
            data: data.datasets[0].data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
        ],
      });
    };

    const fetchPurchaseOrders = async () => {
      const response = await fetch('http://localhost:5000/api/purchase-orders');
      const data = await response.json();
      setPurchaseOrders(data.purchaseOrders);
    };

    fetchPurchaseOrders();
    fetchRevenueData();
    fetchBarChartData();

  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Invoices Overview</h2>
          <BarChart data={barChartData} />
        </div>
        {/* <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Clients Distribution</h2>
          <PieChart data={pieChartData} />
        </div> */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Revenue Trend</h2>
          <LineChart data={lineChartData} />
        </div>
        {/* <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Product Sales</h2>
          <DoughnutChart data={doughnutChartData} />
        </div> */}
      </div>

      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Last 10 Purchase Orders</h2>
        <ul className="space-y-2">
          {purchaseOrders.map((order) => (
            <li key={order.id} className="p-2 border-b border-gray-200">
              Order #{order.id} - {order.user.name} - ${order.total_amount}
              <br />
              <span className="text-gray-500">{order.description}</span>
              <br />
              <span className="text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
