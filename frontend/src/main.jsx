// main.jsx is the entry point for the React application.
// It imports the root React component (App) and renders it into the DOM.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css' // Import global styles (Tailwind)

// ReactDOM.createRoot creates a root to display React components inside a browser DOM node.
// We wrap our App in BrowserRouter to enable React Router's routing capabilities throughout the app.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
