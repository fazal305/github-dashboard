import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/styles/variables.css'
import './assets/styles/global.css'
import './assets/styles/layout.css'
import './assets/styles/components.css'
import './assets/styles/utilities.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
