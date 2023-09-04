import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

setTimeout(() => {
  const p = document.createElement('div');
  p.style.position = 'fixed';
  p.style.top = '0';
  p.style.left = '0';
  p.style.zIndex = '9999';
  p.id = 'portal';
  
  document.body.appendChild(p);
}, 400)


root.render(
  <React.StrictMode>
    <App />
    {/* <div id="portal" style={{ position: 'fixed', zIndex: 9999, left: 0, top: 0 }} /> */}
  </React.StrictMode>
);
