import { useState, useCallback, useRef } from 'react';
import { gsap } from 'gsap';
import { InteractionEvent } from '../types';

/**
 * 粒子交互Hook
 * 处理悬停、点击、双击等交互事件，集成GSAP动画
 */
export const useParticleInteractions = () => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 存储粒子引用以便动画控制
  const particleRefs = useRef<Record<number, any>>({});

  /**
   * 注册粒子引用
   */
  const registerParticle = useCallback((id: number, ref: any) => {
    particleRefs.current[id] = ref;
  }, []);

  /**
   * 处理悬停事件
   */
  const handleHover = useCallback((event: InteractionEvent) => {
    if (isAnimating) return;
    
    setHoveredNode(event.nodeId);
    
    // 如果有可用的粒子引用，执行悬停动画
    const particleRef = particleRefs.current[event.nodeId];
    if (particleRef) {
      gsap.to(particleRef.current?.scale, {
        x: 1.8,
        y: 1.8,
        z: 1.8,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [isAnimating]);

  /**
   * 处理离开悬停事件
   */
  const handleLeave = useCallback((event: InteractionEvent) => {
    if (isAnimating) return;
    
    if (hoveredNode === event.nodeId) {
      setHoveredNode(null);
      
      // 如果有可用的粒子引用，恢复原始大小
      const particleRef = particleRefs.current[event.nodeId];
      if (particleRef && event.nodeId !== selectedNode) {
        gsap.to(particleRef.current?.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  }, [hoveredNode, isAnimating, selectedNode]);

  /**
   * 处理点击事件 - 使用GSAP动画飞向粒子
   */
  const handleClick = useCallback(async (event: InteractionEvent) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // 设置选中的节点
    setSelectedNode(prev => prev === event.nodeId ? null : event.nodeId);
    
    try {
      // 如果有可用的粒子引用，执行点击动画
      const particleRef = particleRefs.current[event.nodeId];
      if (particleRef) {
        // 对选中的粒子执行放大动画
        gsap.to(particleRef.current?.scale, {
          x: 2.5,
          y: 2.5,
          z: 2.5,
          duration: 0.8,
          ease: 'elastic.out(1, 0.8)'
        });
        
        // 对其他粒子执行缩小动画
        Object.keys(particleRefs.current).forEach(key => {
          const id = parseInt(key);
          if (id !== event.nodeId) {
            const otherParticleRef = particleRefs.current[id];
            if (otherParticleRef) {
              gsap.to(otherParticleRef.current?.scale, {
                x: 0.3,
                y: 0.3,
                z: 0.3,
                duration: 0.8,
                ease: 'power2.out'
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('Error during click animation:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 800);
    }
  }, [isAnimating]);

  /**
   * 处理双击事件 - 重置视图
   */
  const handleDoubleClick = useCallback(() => {
    if (isAnimating || !selectedNode) return;
    
    setIsAnimating(true);
    
    try {
      // 恢复所有粒子到原始大小
      Object.keys(particleRefs.current).forEach(key => {
        const id = parseInt(key);
        const particleRef = particleRefs.current[id];
        if (particleRef) {
          gsap.to(particleRef.current?.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.8,
            ease: 'power2.out'
          });
        }
      });
    } catch (error) {
      console.error('Error during double-click reset:', error);
    } finally {
      setTimeout(() => {
        setSelectedNode(null);
        setIsAnimating(false);
      }, 800);
    }
  }, [isAnimating, selectedNode]);

  /**
   * 获取当前交互状态
   */
  const getInteractionState = useCallback(() => {
    return {
      hoveredNode,
      selectedNode,
      isAnimating
    };
  }, [hoveredNode, selectedNode, isAnimating]);

  return {
    registerParticle,
    handleHover,
    handleLeave,
    handleClick,
    handleDoubleClick,
    getInteractionState
  };
};