import React from 'react'
import ReactDOM from 'react-dom/client'
import { attachConsole } from '@tauri-apps/plugin-log';
import App from './App'
import './index.css'
import './i18n';

attachConsole();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
