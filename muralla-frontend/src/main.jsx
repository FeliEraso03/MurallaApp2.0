import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { AboutUs } from './pages/AboutUs.jsx';
import { Instructions } from './pages/Instructions.jsx';
import './App.css';
import './pages.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/editor" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
