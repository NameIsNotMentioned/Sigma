import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './app/App.tsx'
import { AppErrorBoundary } from './components/AppErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </StrictMode>,
)
