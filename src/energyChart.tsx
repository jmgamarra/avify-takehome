import React,{useState,useEffect} from "react";
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
  } from 'chart.js';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
const EnergyChart = () => {
    const [isLoading,setIsLoading]=useState(true);
    const [data,setData]=useState([]);
    const [sourceDate,setSourceDate]=useState({ from: "", to: "" });
    const [error, setError] = useState(null);
    useEffect(() => {

        const getData = async ()=>{
            try {
                const response= await fetch("https://api.carbonintensity.org.uk/generation");
                const result = await response.json();
                const infoOrdered= Array.isArray(result.data.generationmix) ? result.data.generationmix.sort((a,b) => a.perc-b.perc):[];

                setData(infoOrdered);
                setSourceDate({
                    from: result.data.from || "",
                    to: result.data.to || ""
                });
            } catch (error) {
                setError("Error retrieving data");
            }finally{
                setIsLoading(false);
            }
        }
        getData();
    }
    ,[]);

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return {
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      };
      const from = formatDateTime(sourceDate.from);
      const to = formatDateTime(sourceDate.to);
    const averageData = ( dataSource ) => {
        if(!dataSource || dataSource.length===0) return 0;
        const total=dataSource.reduce((sum,item)=> sum+item.perc,0);
        return (total/dataSource.length).toFixed(2);
    };
    const DataToChart=(dataSource)=>({
        labels:dataSource.map((item)=>item.fuel),
        datasets:[
            {
                label: "Energy Contribution (%)",
                data: dataSource.map((item) => item.perc),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 2,
            }
        ]
    });

    if (isLoading) return <p>Loading...</p>;
    if (!data.length) return <p>No data available</p>;
    if (error) return <p>{error}</p>;
    

    return (
    <div style={{ width: "80%", margin: "auto" }}>
    {/* <p>{`Data retrieved on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}</p> */}
    <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "80%",
          marginBottom: "20px",
        }}
      >
        <p style={{ margin: 0 }}>
          {`Date: ${from.date} | From: ${from.time} - To: ${to.time}`}
        </p>
        <p style={{ margin: 0, fontWeight: "bold" }}>{`Average Energy Contribution: ${averageData(data)}%`}</p>
      </div>
      <Line
        data={DataToChart(data)}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
          },
          scales: {
            x: { title: { display: true, text: "Energy Sources" } },
            y: { title: { display: true, text: "Contribution (%)" }, beginAtZero: true },
          },
        }}
      />
      {/* <p style={{ marginTop: "20px", fontWeight: "bold" }}>
        Average Energy Contribution: {averageData(data)}%
      </p> */}
    </div>
  );
}
export {EnergyChart}