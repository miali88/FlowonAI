import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Import the Web Component to ensure it's registered
import './FlowonChatWidget';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
