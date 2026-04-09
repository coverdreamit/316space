import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ApiWarningProvider } from './components/ApiWarningProvider'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ApiWarningProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ApiWarningProvider>
    </BrowserRouter>
  </StrictMode>,
)
