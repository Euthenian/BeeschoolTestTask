// Import React-related dependencies
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import global styles
import '../ai-eigo/styles.css'; // Adjust this path based on your project setup

// Render the main App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
