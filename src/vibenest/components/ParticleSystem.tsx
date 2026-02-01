import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { CreativeNode } from '../../types';

interface ParticleSystemProps {
  nodes: CreativeNode[];
  onHover?: (nodeId: number) => void;
  onClick?: (nodeId: number) => void;
  onDoubleClick?: (nodeId: number) => void;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  nodes, 
  onHover, 
  onClick,
  onDoubleClick
}) => {
  const meshRef = useRef<any>();
  const positions = useMemo(() => {
    const pos = new Float32Array(nodes.length * 3);
    nodes.forEach((node, i) => {
      pos.set(node.position, i * 3);
    });
    return pos;
  }, [nodes]);

  // 使用useFrame实现呼吸动画效果
  useFrame((state) => {
    if (meshRef.current) {
      // 缓慢旋转整个粒子系统
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group>
      <Points 
        ref={meshRef}
        positions={positions} 
        stride={3} 
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#00F0FF"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

export default ParticleSystem;