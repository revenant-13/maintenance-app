import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppContent from './App'; // Import AppContent instead of App
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppContent />
  </React.StrictMode>
);

reportWebVitals();