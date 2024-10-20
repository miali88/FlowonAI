import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// Import the Web Component to ensure it's registered
import './FlowonChatWidget';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

