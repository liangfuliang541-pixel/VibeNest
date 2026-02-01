import React from 'react';
import { createRoot } from 'react-dom/client';
import { VibeNestDemo } from './vibenest';

// 简单的测试页面
const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <VibeNestDemo />
    </div>
  );
};

// 渲染应用
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}