import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enhanced global error logging
console.log('=== OptionsWorld Application Starting ===');
console.log('Environment:', import.meta.env.MODE);
console.log('Timestamp:', new Date().toISOString());

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('=== GLOBAL ERROR ===');
  console.error('Message:', event.message);
  console.error('Filename:', event.filename);
  console.error('Line:', event.lineno);
  console.error('Column:', event.colno);
  console.error('Error object:', event.error);
  console.error('Stack trace:', event.error?.stack);
  console.error('===================');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('=== UNHANDLED PROMISE REJECTION ===');
  console.error('Reason:', event.reason);
  console.error('Promise:', event.promise);
  console.error('================================');
});

// Log React rendering
console.log('Attempting to find root element...');
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('CRITICAL ERROR: Root element not found!');
  console.error('Document body:', document.body);
  console.error('Document HTML:', document.documentElement.outerHTML);
  throw new Error('Root element not found');
}

console.log('Root element found:', rootElement);
console.log('Creating React root...');

try {
  const root = createRoot(rootElement);
  console.log('React root created successfully');
  
  console.log('Rendering App component...');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('App component rendered successfully');
} catch (error) {
  console.error('CRITICAL ERROR during React rendering:', error);
  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  
  // Fallback error display
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh; 
        background: #171717; 
        color: #f5f5f5; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        padding: 20px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          background: #262626; 
          border: 1px solid #404040; 
          border-radius: 8px; 
          padding: 24px; 
          max-width: 600px; 
          width: 100%;
        ">
          <h1 style="color: #ef4444; margin: 0 0 16px 0; font-size: 24px;">Application Failed to Start</h1>
          <p style="margin: 0 0 16px 0; color: #d4d4d4;">The OptionsWorld application encountered a critical error during startup.</p>
          <details style="margin: 16px 0;">
            <summary style="cursor: pointer; color: #a3a3a3;">Error Details</summary>
            <pre style="
              background: #0a0a0a; 
              padding: 12px; 
              border-radius: 4px; 
              overflow: auto; 
              margin: 8px 0 0 0; 
              font-size: 12px; 
              color: #ef4444;
            ">${error instanceof Error ? error.stack : String(error)}</pre>
          </details>
          <button onclick="window.location.reload()" style="
            background: #0ea5e9; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 14px;
          ">Reload Page</button>
        </div>
      </div>
    `;
  }
}

console.log('=== Main.tsx execution completed ===');