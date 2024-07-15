import axios from 'axios';
import { useEffect, useState } from "react";
import DataList from "./DataList";

const UPDATE_INTERVAL = 2000;

const Data = (() => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
        const response = await axios.get('http://192.168.2.1:8000/data');
        setData(response.data);
    };
    fetchData();
    setInterval(fetchData, UPDATE_INTERVAL);
  }, []);

  return (
    <div className="App w-full flex flex-col items-center h-auto overflow-x-hidden flex flex-col justify-start items-center" style={{backgroundColor:"#f6f6f6"}}>
      <header className="w-full h-20 flex flex-row justify-start items-center" style={{backgroundColor:"#bfe8fd"}}>
        <img src="./assets/logo.png" className="w-auto h-3/4 mx-2" alt="logo" />
        <p className="w-full absolute text-center text-4xl font-bold mb-2">Tag Data</p>
      </header>
      <DataList data={data}/>
    </div>
  );
});

export default Data;
