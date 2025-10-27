import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
//import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Registrar el service worker
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
