import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

try {
  document.documentElement.dataset.theme = localStorage.getItem('site-theme') === 'light' ? 'light' : 'dark'
} catch { /* The default theme also works without storage. */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
