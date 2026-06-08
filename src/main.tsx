import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DataStoreProvider } from './services/dataStore'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataStoreProvider>
      <App />
    </DataStoreProvider>
  </StrictMode>,
)
