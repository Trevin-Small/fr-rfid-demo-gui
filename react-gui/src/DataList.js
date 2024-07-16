import { useEffect, useState } from "react";

function dataItem(number, id, time_diff, avg_freq, expiration_time, expired) {
    return  <div className={"w-full h-auto flex flex-row justify-between items-center border-black border "
                + (expired === "Yes" ? " bg-red-400" : "")}>
                <p className="w-1/6 text-center text-md font-semibold">{number}</p>
                <p className="w-1/6 text-center text-md font-semibold">{id}</p>
                <p className="w-1/6 text-center text-md font-semibold">{time_diff < 100000000000 ? time_diff : "Hasn't been read"}</p>
                <p className="w-1/6 text-center text-md font-semibold">{avg_freq}</p>
                <p className="w-1/6 text-center text-lg font-bold">{expiration_time}</p>
                <p className="w-1/6 text-center text-md font-semibold">{expired}</p>
            </div>;
}

const DataList = (({ data }) => {
    const [dataItems, setDataItems] = useState([]);
    const [inStock, setInStock] = useState(0);

    useEffect(() => {
        const title =   <div className="w-full h-auto flex flex-row justify-start items-center border-black border">
                            <p className="w-1/6 text-center text-lg font-bold">Number</p>
                            <p className="w-1/6 text-center text-lg font-bold">ID</p>
                            <p className="w-1/6 text-center text-lg font-bold">Time Since Last Seen</p>
                            <p className="w-1/6 text-center text-lg font-bold">Average Read Frequency</p>
                            <p className="w-1/6 text-center text-lg font-bold">Expiration Time</p>
                            <p className="w-1/6 text-center text-lg font-bold">Is Expired?</p>
                        </div>;
        let newDataItems = [];
        let newInStock = 0;
        let avg_freq_sum = 0;
        let time_diff_sum = 0;
        let exp_time_sum = 0;
        
        let number = 180;
        let num_to_div_by = 0;

        for (let key in data) {
            if (!data[key]["expired"]) {
                newInStock++;
                if (data[key]["time_diff"] < 100000000000 && data[key]["avg_freq"] < 60000) {
                    avg_freq_sum += data[key]["avg_freq"];
                    time_diff_sum += data[key]["time_diff"];
                    exp_time_sum += data[key]["expiration_time"];
                    num_to_div_by++;
                }
            }
            let item = dataItem(number, key, data[key]["time_diff"], data[key]["avg_freq"], data[key]["expiration_time"], data[key]["expired"] ? "Yes" : "No");
            newDataItems.unshift(item);
            number--;
        }

        newDataItems.unshift(dataItem(-1, "AVERAGES", Math.floor(time_diff_sum / num_to_div_by), Math.floor(avg_freq_sum / num_to_div_by), Math.floor(exp_time_sum / num_to_div_by), "N/A"))
        newDataItems.unshift(title);
        setDataItems(newDataItems);
        setInStock(newInStock);
    }, [data]);

    return (
      <div className="w-10/12 h-auto flex flex-col justify-start items-center">
        <p className="text-xl font-bold">Total in stock: {inStock}</p>
        {dataItems}
      </div>  
    );

});

export default DataList;
