import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function RotatingCube() {
  useFrame(() => {
    // 简单的动画帧回调
  });

  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

function BasicApp() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <RotatingCube />
        <OrbitControls />
      </Canvas>
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        color: 'white',
        zIndex: 10 
      }}>
        <h1>Basic R3F Test</h1>
        <p>If you see a pink cube, R3F is working!</p>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<BasicApp />);