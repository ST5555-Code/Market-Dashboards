import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@shared/styles/index.css'
import MapPreview from './MapPreview.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MapPreview />
  </StrictMode>,
)
