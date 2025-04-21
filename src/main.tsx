import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { EnvironmentProvider } from './contexts/EnvironmentContext.tsx'

createRoot(document.getElementById("root")!).render(
  <EnvironmentProvider>
    <App />
  </EnvironmentProvider>
);
