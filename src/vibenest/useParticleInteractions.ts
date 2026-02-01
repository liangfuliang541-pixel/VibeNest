import { useState, useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { CreativeNode } from './types';

export const useParticleInteractions = (
  nodes: CreativeNode[],
  onNodeClick?: (node: CreativeNode) => void,
  onNodeHover?: (node: CreativeNode | null) => void
) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handlePointerOver = useCallback((
    event: ThreeEvent<PointerEvent>,
    index: number
  ) => {
    setHoveredIndex(index);
    if (onNodeHover) {
      onNodeHover(nodes[index]);
    }
    // 阻止事件冒泡
    event.stopPropagation();
  }, [nodes, onNodeHover]);

  const handlePointerOut = useCallback(() => {
    setHoveredIndex(null);
    if (onNodeHover) {
      onNodeHover(null);
    }
  }, [onNodeHover]);

  const handleClick = useCallback((
    event: ThreeEvent<MouseEvent>,
    node: CreativeNode
  ) => {
    event.stopPropagation();
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  return {
    hoveredIndex,
    handlePointerOver,
    handlePointerOut,
    handleClick
  };
};