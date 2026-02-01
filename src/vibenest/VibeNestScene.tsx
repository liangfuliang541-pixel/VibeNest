import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import AdvancedParticleSystem from './AdvancedParticleSystem';
import { CreativeNode } from './types';

interface SceneProps {
  nodes: CreativeNode[];
  onNodeClick?: (node: CreativeNode) => void;
  onNodeHover?: (node: CreativeNode | null) => void;
}

const Scene: React.FC<SceneProps> = ({ nodes, onNodeClick, onNodeHover }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // 轻微旋转动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <>
      {/* 环境光设置 */}
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* 主要内容组 */}
      <group ref={groupRef}>
        <AdvancedParticleSystem 
          nodes={nodes} 
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
        />
      </group>
      
      {/* 相机控制 */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />
      
      {/* 环境背景 */}
      <Environment preset="city" />
      
      {/* 地面阴影 */}
      <ContactShadows 
        position={[0, -2.5, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={10} 
      />
      
      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
    </>
  );
};

interface VibeNestSceneProps {
  nodes: CreativeNode[];
  onNodeClick?: (node: CreativeNode) => void;
  onNodeHover?: (node: CreativeNode | null) => void;
}

const VibeNestScene: React.FC<VibeNestSceneProps> = ({ nodes, onNodeClick, onNodeHover }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 20], fov: 50 }}
      style={{ background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' }}
    >
      <Scene nodes={nodes} onNodeClick={onNodeClick} onNodeHover={onNodeHover} />
    </Canvas>
  );
};

export default VibeNestScene;