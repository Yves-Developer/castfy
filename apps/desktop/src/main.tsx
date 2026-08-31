import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    {/* Hash routing: the packaged app loads over file://, where history
        routing has no server to resolve a path against. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
