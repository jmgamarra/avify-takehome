import React, { useState, useEffect } from "react";
import './EnergyChart.css';
import { Line } from "react-chartjs-2";
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

const descriptions = {
  Biomass: "Includes the burning of Wood, Food Residues and straw. This was included in 'other' before the 1/11/2017",
  Coal: "These stations burn coal to produce heat.This is used to heat water to produce steam which turns a steam turbine which drives a generator to produce electricity. There are currently 9 Coal power stations in the UK. The current Governments plan is to shutdown all coal stations by 2025.",
  CCGT: "Combined Cycle Gas Turbine - These use Natural Gas to power a Turbine which turns a Generator. A second system uses the heat to produce steam which is used to turn a turbine which powers a generator. There are 39 CCGT power stations in the UK.",
  Demand: "This is the total UK demand for electricity. This now includes solar power but does not include unmetered sources such as Small Generation wind power",
  Hydro: "Hydroelectric - There are approximately 200 Hydroelectric stations in the UK. Most are situated in the Scottish and Welsh Mountain areas.",
  Nuclear: "These stations use a Uranium nuclear reaction to produce heat. This is used to heat water to produce steam which turns a steam turbine which drives a generator to produce electricity. The output from these is more constant than other power generation. Fluctations usually indicate maintenance, refuelling or problems. There are currently 8 Nuclear power stations in the UK.",
  Oil: "These stations burn oil to produce heat. This is used to heat water to produce steam which turns a steam turbine which drives a generator to produce electricity. Virtually all Oil stations have been decommissioned with just a small reserve remaining.",
  OCGT: "Open Cycle Gas Turbine - These use Natural Gas, Diesel or Gas oil to power a Turbine which powers a Generator. These are expensive to run so are only used when necessary. There is currently approximately 30 of these in the UK.",
  Other: "This includes anything not included in the above",
  "Pumped Hydro": "Pumped Storage Hydroelectric - Pumped storage incorporates two reservoirs. At times of low demand, generally at night, electricity is used to pump water from the lower to the upper basin. This water is then released to create power at a time when demand, and therefore price, is high. There are currently 4 pumped storage stations in the UK.",
  Renewables: "This is the percent of the energy produced from renewable (wind + solar + hydroelectric + biomass)",
  Solar: "There is no central recording of Solar Generation. This figure is an estimated figure which comes from Sheffield University. This value is now included in the Demand figure",
  Wind: "This is the power from Wind Farms and does not include unmetered wind turbines. The output from this fluctuates with the wind. There are currently over 6500 wind turbines in wind farms",
};

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
          "https://api.carbonintensity.org.uk/generation"
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

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const from = formatDateTime(sourceDate.from);
  const to = formatDateTime(sourceDate.to);

  const calculateAverage = (dataSource) => {
    if (!dataSource || dataSource.length === 0) return 0;
    const total = dataSource.reduce((sum, item) => sum + item.perc, 0);
    return (total / dataSource.length).toFixed(2);
  };

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
