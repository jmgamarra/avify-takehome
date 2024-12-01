import React, { useState, useEffect } from "react";
import './EnergyChart.css';
import { Line } from "react-chartjs-2";
import { descriptions, formatDateTime, calculateAverage } from "../utils/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = "https://api.carbonintensity.org.uk/generation";
const EnergyChart = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [sourceDate, setSourceDate] = useState({ from: "", to: "" });
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          API_URL
        );
        const result = await response.json();
        const sortedData = Array.isArray(result.data.generationmix)
          ? result.data.generationmix.sort((a, b) => a.perc - b.perc)
          : [];

        setData(sortedData);
        setSourceDate({
          from: result.data.from || "",
          to: result.data.to || "",
        });
      } catch (error) {
        setError("Unable to load data. Try again later");
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);



  const from = formatDateTime(sourceDate.from);
  const to = formatDateTime(sourceDate.to);

  const chartData = {
    labels: data.map((item) => item.fuel),
    datasets: [
      {
        label: "Energy Contribution (%)",
        data: data.map((item) => item.perc),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <div
        className="left-panel"
      >
        <h3>Key Details</h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {Object.entries(descriptions).map(([key, desc]) => (
            <li
              key={key}

              onClick={() =>
                setActiveKey(activeKey === key ? null : key) 
              }
            >
              <div
                className={`key ${activeKey === key ? "active" : ""}`}
              >
                {key}
              </div>
              {activeKey === key &&
                <div
                  className="description"
                >
                  {desc}
                </div>
              }
            </li>
          ))}
        </ul>
      </div>

      <div className="right-panel">
        <p>{`Date: ${from.date} | From: ${from.time} - To: ${to.time}`}</p>
        <p style={{ fontWeight: "bold" }}>
          {`Average Energy Contribution: ${calculateAverage(data)}%`}
        </p>
        <div>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
              },
              scales: {
                x: {
                  title: { display: true, text: "Energy Sources" },
                },
                y: {
                  title: { display: true, text: "Contribution (%)" },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { EnergyChart };
