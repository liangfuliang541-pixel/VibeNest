import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Matrix4, Color } from 'three';
import { CreativeNode } from '../../types';

interface InstancedParticleSystemProps {
  nodes: CreativeNode[];
  onHover?: (nodeId: number) => void;
  onClick?: (nodeId: number) => void;
  onDoubleClick?: (nodeId: number) => void;
  selectedNodeId?: number | null;
  hoveredNodeId?: number | null;
}

const InstancedParticleSystem: React.FC<InstancedParticleSystemProps> = ({ 
  nodes, 
  onHover, 
  onClick,
  onDoubleClick,
  selectedNodeId,
  hoveredNodeId
}) => {
  const instancedMeshRef = useRef<any>();
  const matrices = useRef<(Matrix4 | null)[]>([]);
  const colors = useRef<(Color | null)[]>([]);
  const { size } = useThree();

  // 初始化矩阵和颜色
  const initRefs = useCallback(() => {
    matrices.current = nodes.map(() => new Matrix4());
    colors.current = nodes.map(node => new Color(node.color || '#00F0FF'));
  }, [nodes]);

  // 在组件挂载时初始化
  useMemo(() => {
    initRefs();
  }, [initRefs]);

  // 更新矩阵位置
  useFrame(() => {
    if (!instancedMeshRef.current) return;

    nodes.forEach((node, index) => {
      const matrix = matrices.current[index];
      if (!matrix) return;

      const [x, y, z] = node.position;
      matrix.setPosition(x, y, z);

      // 根据节点状态调整大小
      const scale = getNodeScale(node.id, selectedNodeId, hoveredNodeId);
      matrix.scale(new Vector3(scale, scale, scale));

      // 应用呼吸动画效果
      const breathingScale = 1 + Math.sin(Date.now() * 0.001 + node.id * 0.5) * 0.1;
      matrix.scale(new Vector3(breathingScale, breathingScale, breathingScale));

      // 更新实例
      instancedMeshRef.current.setMatrixAt(index, matrix);
    });

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  // 计算节点缩放比例
  const getNodeScale = (nodeId: number, selectedId: number | null, hoveredId: number | null): number => {
    if (selectedId === nodeId) return 2.5; // 选中的节点放大
    if (hoveredId === nodeId) return 1.8;  // 悬停的节点中等放大
    if (selectedId !== null) return 0.3;   // 有选中节点时，其他节点缩小
    return 1.0;                            // 默认大小
  };

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[undefined, undefined, nodes.length]}
      onPointerOver={(e) => {
        e.stopPropagation();
        const nodeId = e.instanceId;
        if (nodeId !== undefined && onHover) {
          onHover(nodeId);
        }
      }}
      onClick={(e) => {
        const nodeId = e.instanceId;
        if (nodeId !== undefined && onClick) {
          onClick(nodeId);
        }
      }}
      onDoubleClick={(e) => {
        const nodeId = e.instanceId;
        if (nodeId !== undefined && onDoubleClick) {
          onDoubleClick(nodeId);
        }
      }}
    >
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial 
        color="#00F0FF" 
        transparent 
        opacity={0.8}
        roughness={0.2}
        metalness={0.8}
      />
    </instancedMesh>
  );
};

export default InstancedParticleSystem;