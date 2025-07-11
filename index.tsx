import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        // This should not happen if DOM is loaded, but as a safeguard.
        console.error("Fatal: Root element not found.");
        return;
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
};

// Defer script execution until the DOM is fully parsed and ready.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
} else {
    // DOM is already ready, mount immediately.
    mountApp();
}
