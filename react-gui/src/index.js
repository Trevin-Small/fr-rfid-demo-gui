import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/tailwind.output.css';
import App from './App';
import Data from './Data';
import Graphs from './Graphs';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<App />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/data" element={<Data />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);