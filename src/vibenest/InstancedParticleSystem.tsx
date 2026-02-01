import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useParticleInteractions } from './useParticleInteractions';
import { CreativeNode } from './types';

interface InstancedParticleSystemProps {
  nodes: CreativeNode[];
  onNodeClick?: (node: CreativeNode) => void;
  onNodeHover?: (node: CreativeNode | null) => void;
}

const InstancedParticleSystem: React.FC<InstancedParticleSystemProps> = ({ 
  nodes, 
  onNodeClick, 
  onNodeHover 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { hoveredIndex, handleClick, handlePointerOver, handlePointerOut } = useParticleInteractions(
    nodes,
    onNodeClick,
    onNodeHover
  );
  
  // 创建几何体和材质
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.8
  }), []);

  // 初始化实例矩阵
  useEffect(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const matrix = new THREE.Matrix4();
      matrix.setPosition(node.position[0], node.position[1], node.position[2]);
      
      // 设置初始缩放
      const scale = node.size;
      matrix.scale(new THREE.Vector3(scale, scale, scale));
      
      meshRef.current.setMatrixAt(i, matrix);
      
      // 设置每个实例的颜色
      const color = new THREE.Color(node.color);
      meshRef.current.setColorAt(i, color);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [nodes]);

  // 动画更新
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const matrix = new THREE.Matrix4();
      
      // 应用位置
      matrix.setPosition(node.position[0], node.position[1], node.position[2]);
      
      // 应用呼吸动画缩放
      const scale = node.size * (0.8 + 0.2 * Math.sin(time * 2 + i * 0.1));
      matrix.scale(new THREE.Vector3(scale, scale, scale));
      
      // 如果是悬停状态，额外放大
      if (hoveredIndex === i) {
        matrix.scale(new THREE.Vector3(1.8, 1.8, 1.8));
      }
      
      meshRef.current.setMatrixAt(i, matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // 处理交互事件
  const handleMeshClick = (event: THREE.Event) => {
    if (event.instanceId !== undefined && nodes[event.instanceId]) {
      handleClick(event as unknown as React.MouseEvent, nodes[event.instanceId]);
    }
  };

  const handlePointerOver = (event: THREE.Event) => {
    if (event.instanceId !== undefined) {
      (event as any).stopPropagation(); // 模拟 stopPropagation
      handlePointerOver(event as any, event.instanceId);
    }
  };

  const handlePointerOut = () => {
    handlePointerOut();
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, nodes.length]}
      castShadow
      receiveShadow
      onClick={handleMeshClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
};

export default InstancedParticleSystem;