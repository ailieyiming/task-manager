import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return

    const checkForUpdates = () => {
      if (document.visibilityState === 'visible') {
        void registration.update()
      }
    }

    document.addEventListener('visibilitychange', checkForUpdates)
    window.addEventListener('pageshow', checkForUpdates)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
