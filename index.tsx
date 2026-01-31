
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    // Jika root belum ada, kita tunggu sebentar atau beri peringatan yang lebih jelas
    console.error("Root element #root not found. Retrying in 100ms...");
    setTimeout(mountApp, 100);
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Memastikan DOM sudah siap sebelum mencari elemen #root
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
