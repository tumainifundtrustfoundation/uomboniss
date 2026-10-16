import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import './lib/firebase';

// Guard against unhandled promise rejections or global script errors in sandboxed iframes
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.includes('INTERNAL ASSERTION FAILED') ||
      reasonStr.includes('Pending promise was never set') ||
      reasonStr.includes('Could not reach Cloud Firestore backend') ||
      reasonStr.includes('the client is offline')
    ) {
      event.preventDefault();
      return;
    }
    console.warn('Caught unhandled promise rejection:', event.reason);
    // Prevent standard browser crash banner if non-critical
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    if (
      msg.includes('INTERNAL ASSERTION FAILED') ||
      msg.includes('Pending promise was never set') ||
      msg.includes('Could not reach Cloud Firestore backend') ||
      msg.includes('the client is offline')
    ) {
      event.preventDefault();
      return;
    }
    console.warn('Caught global error event:', event.message);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

