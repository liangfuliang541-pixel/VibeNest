import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Sky } from '@react-three/drei';
import { gsap } from 'gsap';
import AdvancedParticleSystem from './AdvancedParticleSystem';
import { CreativeNode } from '../types';
import { useParticleInteractions } from '../hooks/useParticleInteractions';

interface VibeNestSceneProps {
  nodes: CreativeNode[];
}

const VibeNestScene: React.FC<VibeNestSceneProps> = ({ nodes }) => {
  const { 
    registerParticle, 
    handleHover, 
    handleLeave, 
    handleClick, 
    handleDoubleClick, 
    getInteractionState 
  } = useParticleInteractions();
  
  const { hoveredNode, selectedNode } = getInteractionState();
  const cameraRef = useRef<any>(null);

  // 处理节点点击事件
  const handleNodeClick = (nodeId: number) => {
    handleClick({ type: 'click', nodeId });
    
    // 如果点击的是已选中的节点，则重置视图
    if (selectedNode === nodeId) {
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: 0,
        z: 10,
        duration: 1.5,
        ease: 'power2.inOut'
      });
    } else {
      // 飞向选中的节点
      const targetNode = nodes.find(node => node.id === nodeId);
      if (targetNode) {
        const [x, y, z] = targetNode.position;
        gsap.to(cameraRef.current.position, {
          x: x * 0.5, // 缩短距离以获得更好的视角
          y: y * 0.5,
          z: z * 0.5 + 5, // 添加一点额外距离
          duration: 1.5,
          ease: 'power2.inOut'
        });
      }
    }
  };

  // 处理双击事件
  const handleNodeDoubleClick = (nodeId: number) => {
    handleDoubleClick();
    
    // 重置相机位置
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 0,
      z: 10,
      duration: 1.5,
      ease: 'power2.inOut'
    });
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75 }}
      style={{ background: '#0A0E14' }}
    >
      {/* 环境光和光源 */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00F0FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#BD00FF" />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1}
        castShadow
        color="#E6EDF3"
      />

      {/* 星空背景 */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* 地平线效果 */}
      <Sky
        distance={450000}
        sunPosition={[100, 10, 100]}
        inclination={0}
        azimuth={0.25}
      />

      {/* 高级粒子系统 */}
      <Suspense fallback={null}>
        <AdvancedParticleSystem
          nodes={nodes}
          onHover={(nodeId) => handleHover({ type: 'hover', nodeId })}
          onClick={handleNodeClick}
          onDoubleClick={handleNodeDoubleClick}
          selectedNodeId={selectedNode}
          hoveredNodeId={hoveredNode}
        />
      </Suspense>

      {/* 相机控制 */}
      <OrbitControls
        ref={cameraRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={50}
      />

      {/* 环境设置 */}
      <Environment preset="night" />
    </Canvas>
  );
};

// 包装组件以提供完整的场景
const VibeNestSceneWrapper: React.FC<VibeNestSceneProps> = ({ nodes }) => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <VibeNestScene nodes={nodes} />
    </div>
  );
};

export default VibeNestSceneWrapper;