import axios from 'axios';
import { useEffect, useState } from "react";
import GridContainer from "./GridContainer";

const UPDATE_INTERVAL = 3000;

const Products = [
  {name:"Snickers", id:"snickers", src:"./assets/snickers.png", quantity:2},
  {name:"Acai Berry Blast", id:"acai", src:"./assets/acai.png", quantity:0},
  {name:"Chocolate Chill", id:"chocolate", src:"./assets/chocolate.png", quantity:0},
  {name:"Cotton Candy", id:"cotton", src:"./assets/cotton_candy.png", quantity:0},
  {name:"Cool Mint Chip", id:"mint", src:"./assets/mint.png", quantity:0},
  {name:"Oreo Cookies 'N Cream", id:"oreo", src:"./assets/oreo.png", quantity:0},
  {name:"PB Cup", id:"pb", src:"./assets/pbcup.png", quantity:0},
  {name:"Strawberry Banana", id:"straw", src:"./assets/strawberry_banana.png", quantity:0},
  {name:"Vanilla Bliss", id:"vanilla", src:"./assets/vanilla.png", quantity:0},
  {name:"Mango", id:"mango", src:"./assets/mango.png", quantity:0},
  {name:"Mystery Flavor", id:"mystery", src:"./assets/mystery.png", quantity:0}
];

const App = (() => {
  const [products, setProducts] = useState(Products);
  const [quantities, setQuantities] = useState({});
  const [cupTotal, setTotal] = useState(0);


  useEffect(() => {
    const fetchQuantities = async () => {
      const response = await axios.get('http://trevinsmall@raspberrypi.meshsystems.com:8000/inventory');
      setQuantities(response.data.inventory);
    };
    fetchQuantities();
    setInterval(fetchQuantities, UPDATE_INTERVAL);
  }, []);

  useEffect(() => {
    const newProducts = products;

    for (let i = 0; i < products.length; i++) {
      let q = quantities[Products[i].id];
      newProducts[i].quantity = q;
    }

    setTotal(quantities.total);
    setProducts(newProducts);
  }, [quantities]);

  return (
    <div className="App w-full h-auto overflow-x-hidden flex flex-col justify-start items-center" style={{backgroundColor:"#f6f6f6"}}>
      <header className="w-full h-20 flex flex-row justify-start items-center" style={{backgroundColor:"#bfe8fd"}}>
        <img src="./assets/logo.png" className="w-auto h-3/4 mx-2" alt="logo" />
        <p className="w-full absolute text-center text-4xl font-bold mb-2">Store Inventory</p>
      </header>
      <p className="w-full text-center text-xl font-semibold mt-3">Total in Stock: {cupTotal}</p>
      <GridContainer itemData={products}/>
    </div>
  );
});

export default App;
