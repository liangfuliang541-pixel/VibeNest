import React from 'react';
import { createRoot } from 'react-dom/client';

const TestApp = () => {
  return (
    <div style={{ padding: '20px', color: '#fff', background: '#0A0E14' }}>
      <h1>VibeNest Test Page</h1>
      <p>If you see this, React is working!</p>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);