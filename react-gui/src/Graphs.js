import axios from 'axios';
import { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  TimeScale,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Decimation
} from 'chart.js';
import Header from './Header';
import Dropdown from './Dropdown';

ChartJS.register(LineElement, PointElement, TimeScale, LinearScale, CategoryScale, Tooltip, Legend, Decimation);

const UPDATE_INTERVAL = 2000;

const GRAPH_OPTIONS = {
  animation: false,
  plugins: {
    title: {
      display: false
    },
    legend: {
      display: false
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 20,
        maxTicksLimit: 15,
        color: 'black',
        font: {
          size: 20
        }
      }
    },
    y: {
      type: 'linear',
      beginAtZero: true,
      ticks: {
        color: 'black',
        font: {
          size: 20
        }
      }
    }
  }
}

const DEFAULT_DATA = {
  labels: [],
  datasets: [
    {
      label: 'Inventory',
      data: [],
      backgroundColor: ['#004e7d'],
      borderColor: ['#004e7d'],
      borderWidth: 2,
      radius: 0
    }
  ]
}

let DROPDOWN_OPTIONS = [
  ["Total Inventory", "total"],
  ["Snickers", "snickers"],
  ["Acai Berry Blast", "acai"],
  ["Chocolate Chill", "chocolate"],
  ["Cotton Candy", "cotton"],
  ["Cool Mint Chip", "mint"],
  ["Oreo Cookies 'N Cream", "oreo"],
  ["PB Cup", "pb"],
  ["Strawberry Banana", "straw"],
  ["Vanilla Bliss", "vanilla"],
  ["Mango", "mango"],
  ["Mystery Flavor", "mystery"]
];

const Graphs = (() => {
  const [inventoryData, setInventoryData] = useState([]);
  const [sortBy, setSortBy] = useState(DROPDOWN_OPTIONS[0]);
  const [activeData, setActiveData] = useState(DEFAULT_DATA);
  const [currentTotal, setCurrentTotal] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('http://localhost:8000/inventory-history');
      setInventoryData(response.data);
    };

    fetchData();
    let interval = setInterval(fetchData, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let newActiveData = structuredClone(DEFAULT_DATA);

    for (let i in inventoryData) {
      let entry = inventoryData[i];
      console.log(entry);
      //console.log("inv " + i + " Time: " + (new Date(entry.timestamp)).toLocaleTimeString().split(' ')[0]);
      newActiveData.labels.push((new Date(entry.timestamp)).toLocaleTimeString().split(' ')[0]);
      newActiveData.datasets[0].data.push(entry[sortBy[1]]);
    }

    if (newActiveData.labels.length > 0) {
      let newCurrentTotal = newActiveData.datasets[0].data[newActiveData.datasets[0].data.length - 1];
      setCurrentTotal(newCurrentTotal);
    }

    setActiveData(newActiveData);
  }, [inventoryData, sortBy]);

  const onDropdownChange = async (selectedItem) => {
      setSortBy(selectedItem);
  }

  return (
    <div className="App w-full h-screen flex flex-col items-center h-auto overflow-x-hidden flex flex-col justify-start items-center" style={{backgroundColor:"#f6f6f6"}}>
      <Header title={"Inventory Graphs"} />
      <div className="w-10/12 h-auto flex flex-col justify-start items-center py-6 text-center">
        <div className="w-full flex justify-end items-center px-6 mb-4">
          <div className="w-1/3"></div>
          <div className="w-1/3 flex flex-col justify-end items-center">
            <p className="font-bold text-xl">{sortBy[0]}</p>
            <p className="text-md">{"Current Quantity: " + currentTotal}</p>
          </div>
          <div className="w-1/3 flex flex-row justify-end items-center">
            <p className="font-bold text-xl mr-2">Selected: </p>
            <Dropdown options={DROPDOWN_OPTIONS} callback={onDropdownChange} />
          </div>
        </div>
        <Line data={activeData} options={GRAPH_OPTIONS} />
      </div>
    </div>
  );
});

export default Graphs;
