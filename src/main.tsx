import './polyfills';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary isAppLevel={true}>
      <App />
    </ErrorBoundary>
  );

  // Notify watchdog timer that React has initiated rendering successfully
  if (typeof window !== 'undefined') {
    // @ts-expect-error - watchdog indicator
    window.__APPLET_RENDERED__ = true;
    const fallback = document.getElementById('emergency-fallback');
    if (fallback) {
      fallback.style.display = 'none';
    }
  }
}
