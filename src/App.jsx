import React, { useEffect, useRef } from 'react';

/**
 * VibeNest 主应用组件 - 数字极简主义创意星空
 * 
 * 【项目背景】
 * 福建省小南同学网络科技有限公司 - 专注创意灵感可视化平台
 * 
 * 【技术架构调整】
 * 由于Qoder预览环境WebGL资源分配限制，从Three.js架构调整为HTML5 Canvas 2D API
 * 确保100%环境兼容性与稳定渲染
 * 
 * 【设计理念】
 * - Digital Minimalism: 极简设计语言
 * - Ambient Fluidity: 流动的视觉体验
 * - Brand Colors: 深空(#0A0E14)、赛博青(#00F0FF)、紫韵(#BD00FF)
 */
export default function App() {
  // Canvas 引用，用于获取2D渲染上下文
  const canvasRef = useRef(null);

  useEffect(() => {
    // 获取Canvas元素及其2D渲染上下文
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    /**
     * 响应式画布尺寸调整
     * 监听窗口大小变化，确保画布始终占满全屏
     */
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize(); // 初始化时设置一次

    /**
     * 粒子系统初始化
     * 每个粒子代表一个创意灵感节点
     * 粒子属性：位置、尺寸、移动速度、透明度
     */
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,           // X轴随机位置
      y: Math.random() * canvas.height,          // Y轴随机位置
      size: Math.random() * 2 + 1,              // 粒子尺寸 (1-3px)
      speedX: (Math.random() - 0.5) * 0.5,      // X轴移动速度
      speedY: (Math.random() - 0.5) * 0.5,      // Y轴移动速度
      opacity: Math.random()                     // 随机透明度
    }));

    /**
     * 核心渲染循环
     * 实现粒子动画效果：平滑移动、边界反弹、呼吸感
     */
    const render = () => {
      // 绘制深空背景色
      ctx.fillStyle = '#0A0E14'; // 数字极简主义深空色
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 更新并绘制每个粒子
      particles.forEach(p => {
        // 更新粒子位置
        p.x += p.speedX;
        p.y += p.speedY;

        // 边界碰撞检测与反弹
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        // 绘制圆形粒子 - 代表创意节点
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); // 完整圆圈
        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`; // 赛博青色
        ctx.fill();
      });

      // 请求下一帧渲染，形成连续动画
      animationFrameId = requestAnimationFrame(render);
    };
    render(); // 启动渲染循环

    /**
     * 清理函数
     * 组件卸载时移除事件监听器和动画帧
     */
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // 空依赖数组，确保effect只在挂载时执行一次

  /**
   * JSX渲染结构
   * Canvas画布 + 覆盖UI层
   */
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 主要渲染区域 - Canvas画布 */}
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      
      {/* 覆盖在画布上的UI信息层 */}
      <div style={{
        position: 'absolute', 
        top: '40px', 
        left: '40px',
        color: '#E6EDF3', 
        pointerEvents: 'none' // 确保不影响Canvas交互
      }}>
        {/* 品牌标识 */}
        <h1 style={{ 
          fontFamily: 'serif', 
          fontSize: '2.5rem', 
          margin: 0 
        }}>
          VibeNest
        </h1>
        {/* 系统状态指示器 */}
        <p style={{ 
          color: '#00F0FF', 
          fontFamily: 'monospace' 
        }}>
          [ SYSTEM_STATUS: STABLE_CANVAS_ACTIVE ]
        </p>
        {/* 版权信息 */}
        <p style={{ 
          color: '#8B949E', 
          fontSize: '0.9rem' 
        }}>
          福建省小南同学网络科技有限公司
        </p>
      </div>
    </div>
  );
}