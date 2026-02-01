import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { CreativeNode } from '../../types';

interface AdvancedParticleSystemProps {
  nodes: CreativeNode[];
  onHover?: (nodeId: number) => void;
  onClick?: (nodeId: number) => void;
  onDoubleClick?: (nodeId: number) => void;
  selectedNodeId?: number | null;
  hoveredNodeId?: number | null;
}

const AdvancedParticleSystem: React.FC<AdvancedParticleSystemProps> = ({ 
  nodes, 
  onHover, 
  onClick,
  onDoubleClick,
  selectedNodeId,
  hoveredNodeId
}) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const textRefs = useRef<{[key: number]: any}>({});
  const matrices = useRef<THREE.Matrix4[]>([]);
  const colors = useRef<THREE.Color[]>([]);

  // 初始化数据
  useMemo(() => {
    matrices.current = nodes.map(node => {
      const matrix = new THREE.Matrix4();
      const [x, y, z] = node.position;
      matrix.setPosition(x, y, z);
      return matrix;
    });

    colors.current = nodes.map(node => new THREE.Color(node.color || '#00F0FF'));
  }, [nodes]);

  // 计算节点缩放比例
  const calculateNodeScale = (nodeId: number, selectedId: number | null, hoveredId: number | null): number => {
    if (selectedId === nodeId) return 2.5; // 选中的节点放大
    if (hoveredId === nodeId) return 1.8;  // 悬停的节点中等放大
    if (selectedId !== null) return 0.3;   // 有选中节点时，其他节点缩小
    return 1.0;                            // 默认大小
  };

  // 更新动画帧
  useFrame((state) => {
    if (!instancedMeshRef.current) return;

    // 更新每个粒子的变换矩阵
    nodes.forEach((node, index) => {
      const matrix = matrices.current[index];
      if (!matrix) return;

      // 获取当前缩放
      let scale = calculateNodeScale(node.id, selectedNodeId, hoveredNodeId);
      
      // 添加呼吸动画效果
      const breathingEffect = 1 + Math.sin(state.clock.elapsedTime * 2 + node.id * 0.7) * 0.05;
      scale *= breathingEffect;

      // 更新位置和缩放
      const [x, y, z] = node.position;
      matrix.setPosition(x, y, z);
      matrix.scale(new THREE.Vector3(scale, scale, scale));
      
      // 应用到实例网格
      instancedMeshRef.current!.setMatrixAt(index, matrix);
      
      // 更新颜色
      instancedMeshRef.current!.setColorAt(index, colors.current[index]);
    });

    instancedMeshRef.current.instanceMatrix!.needsUpdate = true;
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  // 处理悬停事件
  const handleParticlePointerOver = useCallback((e: any) => {
    e.stopPropagation();
    const nodeId = e.instanceId;
    if (nodeId !== undefined && onHover) {
      onHover(nodeId);
    }
  }, [onHover]);

  // 处理点击事件
  const handleParticleClick = useCallback((e: any) => {
    const nodeId = e.instanceId;
    if (nodeId !== undefined && onClick) {
      onClick(nodeId);
    }
  }, [onClick]);

  // 处理双击事件
  const handleParticleDoubleClick = useCallback((e: any) => {
    const nodeId = e.instanceId;
    if (nodeId !== undefined && onDoubleClick) {
      onDoubleClick(nodeId);
    }
  }, [onDoubleClick]);

  const geometry = useMemo(() => new THREE.SphereGeometry(0.1, 16, 16), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    roughness: 0.2,
    metalness: 0.8
  }), []);

  return (
    <group>
      <primitive
        object={new THREE.InstancedMesh(geometry, material, nodes.length)}
        ref={instancedMeshRef}
        onPointerOver={handleParticlePointerOver}
        onClick={handleParticleClick}
        onDoubleClick={handleParticleDoubleClick}
      />

      {/* 为选中的节点添加标签 */}
      {selectedNodeId !== null && (
        (() => {
          const selectedNode = nodes.find(node => node.id === selectedNodeId);
          if (!selectedNode) return null;

          const [x, y, z] = selectedNode.position;
          return (
            <Text
              ref={(ref) => {
                if (ref) textRefs.current[selectedNodeId] = ref;
              }}
              position={[x, y + 0.5, z]}
              fontSize={0.3}
              color="#00F0FF"
              anchorX="center"
              anchorY="middle"
            >
              {selectedNode.title}
            </Text>
          );
        })()
      )}
    </group>
  );
};

export default AdvancedParticleSystem;