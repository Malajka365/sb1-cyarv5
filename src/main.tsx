import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface CookieChangeEvent {
  changed: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }>;
  deleted: Array<{
    name: string;
    domain?: string;
    path?: string;
  }>;
}

interface CookieStore extends EventTarget {
  addEventListener(
    type: 'change',
    listener: (event: CustomEvent<CookieChangeEvent>) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: 'change',
    listener: (event: CustomEvent<CookieChangeEvent>) => void,
    options?: boolean | EventListenerOptions
  ): void;
}

declare global {
  interface Window {
    cookieStore?: CookieStore;
    FB: {
      init: (options: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      AppEvents: {
        logPageView: () => void;
      };
    };
  }
}

// Initialize Facebook SDK
window.fbAsyncInit = function() {
  window.FB.init({
    appId: import.meta.env.VITE_FACEBOOK_APP_ID,
    cookie: true,
    xfbml: true,
    version: 'v21.0'
  });
  window.FB.AppEvents.logPageView();
};

// Handle third-party cookie warnings
if ('cookieStore' in window) {
  window.cookieStore?.addEventListener?.('change', (event: CustomEvent<CookieChangeEvent>) => {
    console.debug('Cookie change detected:', event.detail);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);