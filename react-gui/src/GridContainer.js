// GridContainer.js
import React from 'react';
import GridItem from './GridItem';
import './styles/Grid.css'; // Import the CSS file for styles

const GridContainer = ({ itemData }) => {
  return (
    <div className="grid-container w-10/12">
      {itemData.map((item, index) => (
        <GridItem key={index} name={item.name} imgSrc={item.src} quantity={item.quantity} />
      ))}
    </div>
  );
};

export default GridContainer;
