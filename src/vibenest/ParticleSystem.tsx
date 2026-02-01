import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { CreativeNode } from './types';
import { useParticleInteractions } from './useParticleInteractions';

interface ParticleSystemProps {
  nodes: CreativeNode[];
  onNodeClick?: (node: CreativeNode) => void;
  onNodeHover?: (node: CreativeNode | null) => void;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
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
  
  // 预计算变换矩阵
  const transforms = useMemo(() => {
    return nodes.map(node => {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(node.position[0], node.position[1], node.position[2]);
      return matrix;
    });
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
        matrix.scale(new THREE.Vector3(1.5, 1.5, 1.5));
      }
      
      meshRef.current.setMatrixAt(i, matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <Instances 
      limit={nodes.length} 
      ref={meshRef} 
      castShadow 
      receiveShadow
    >
      <sphereGeometry args={[1, 16, 16]} />
      {nodes.map((node, index) => (
        <Instance 
          key={node.id}
          position={node.position as [number, number, number]}
          onPointerOver={(e) => handlePointerOver(e, index)}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, node)}
          userData={{ node, index }}
        />
      ))}
      <meshStandardMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.8} 
        roughness={0.2} 
        metalness={0.8}
      />
    </Instances>
  );
};

export default ParticleSystem;