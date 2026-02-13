import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App';
import '@/styles/globals.css';
import { registerSW } from 'virtual:pwa-register';
// import { connectWebSocket, disconnectWebSocket } from '@/api/ws';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerSW({ immediate: true });

// connectWebSocket();
// window.addEventListener("beforeunload", () => {
//   disconnectWebSocket();
// });
