// main.jsx - Ensure environment variables are loaded
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/theme.css';
import './styles/responsive.css';

// Log environment variables on startup
console.log('🚀 DataPRO CMS Starting...');
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_APP_ID:', import.meta.env.VITE_APP_ID);
console.log('VITE_APP_NAME:', import.meta.env.VITE_APP_NAME);

if (!import.meta.env.VITE_APP_ID) {
  console.error('❌ CRITICAL ERROR: VITE_APP_ID is not defined in .env file!');
  console.error('Please check your .env file and restart the dev server.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);