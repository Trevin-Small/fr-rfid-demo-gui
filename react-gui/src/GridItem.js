// GridItem.js
import React from 'react';

const GridItem = ({ name, imgSrc, quantity }) => {
  return (
    <div className="grid-item rounded-lg flex flex-col justify-between items-center h-auto w-40 p-6 text-center" style={{backgroundColor:"white", boxShadow:"0 4px 8px rgba(0, 0, 0, 0.1)"}}>
        <p className="font-bold text-xl">{name}</p>
        <div>
            <img src={imgSrc} className="h-auto" alt={name} />
            <div className="rounded-md mt-3 py-1" style={{backgroundColor:quantity === 0 ? "red" : "white"}}>
              {
                quantity === 0 ?  
                  <p className="font-bold text-xl text-white">Out of Stock!</p> :
                  <p className="font-bold text-xl">In Stock: {quantity}</p>
              }
            </div>
        </div>
    </div>
  );
};

export default GridItem;
