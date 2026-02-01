import React, { useEffect, useRef, useState } from 'react';

/**
 * VibeNest 主应用组件 - 数字极简主义创意星空
 * 
 * 【项目背景】
 * 福建省小南同学网络科技有限公司 - 专注创意灵感可视化平台
 * 
 * 【技术架构】
 * HTML5 Canvas 2D API - 确保100%环境兼容性与稳定渲染
 * 
 * 【设计理念】
 * - Digital Minimalism: 极简设计语言
 * - Ambient Fluidity: 流动的视觉体验
 * - Brand Colors: 深空(#0A0E14)、赛博青(#00F0FF)、紫韵(#BD00FF)
 */
export default function App() {
  // Canvas 引用，用于获取2D渲染上下文
  const canvasRef = useRef(null);
  // 当前选中的创意节点状态
  const [selectedIdea, setSelectedIdea] = useState(null);
  
  // 初始创意数据 - 每个粒子代表一个创意
  const initialIdeas = [
    { 
      title: "开源工具创意库", 
      desc: "一个展示技术宅各种奇思妙想的开放平台。" 
    },
    { 
      title: "情绪追踪日记", 
      desc: "利用 AI 记录并分析每日情绪波动的公益工具。" 
    }
  ];

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
     * 粒子属性：位置、尺寸、移动速度、关联数据
     */
    const particles = Array.from({ length: 100 }, (_, i) => ({
      x: Math.random() * canvas.width,           // X轴随机位置
      y: Math.random() * canvas.height,          // Y轴随机位置
      size: 3,                                  // 粒子固定尺寸
      speedX: (Math.random() - 0.5) * 0.6,    // X轴移动速度
      speedY: (Math.random() - 0.5) * 0.6,    // Y轴移动速度
      data: initialIdeas[i % initialIdeas.length] // 关联创意数据
    }));

    /**
     * 核心渲染循环
     * 实现粒子动画效果：平滑移动、边界反弹、发光效果
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
        
        // 添加发光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00F0FF'; // 赛博青色发光
        ctx.fillStyle = '#00F0FF';   // 粒子主体颜色
        ctx.fill();
        
        // 重置阴影效果，避免影响其他绘制
        ctx.shadowBlur = 0;
      });

      // 请求下一帧渲染，形成连续动画
      animationFrameId = requestAnimationFrame(render);
    };
    render(); // 启动渲染循环

    /**
     * 交互事件处理
     * 实现点击粒子选择创意节点功能
     */
    const handleCanvasClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 检测点击位置是否在粒子范围内
      for (const p of particles) {
        const distance = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2);
        if (distance <= p.size + 5) { // 添加一点容错范围
          setSelectedIdea(p.data);
          break;
        }
      }
    };

    // 添加点击事件监听器
    canvas.addEventListener('click', handleCanvasClick);

    /**
     * 清理函数
     * 组件卸载时移除事件监听器和动画帧
     */
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // 空依赖数组，确保effect只在挂载时执行一次

  /**
   * JSX渲染结构
   * Canvas画布 + 覆盖UI层 + 创意详情面板
   */
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative', 
      background: '#0A0E14' // 深空背景色
    }}>
      {/* 主要渲染区域 - Canvas画布 */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          cursor: 'pointer' // 鼠标悬停时显示可点击状态
        }} 
      />
      
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
          margin: 0, 
          fontSize: '2rem' 
        }}>
          VibeNest
        </h1>
        {/* 版权信息 */}
        <p style={{ 
          color: '#00F0FF',
          margin: '5px 0 0 0'
        }}>
          [ 福建省小南同学网络科技有限公司 ]
        </p>
      </div>

      {/* 创意详情面板 - 当有选中创意时显示 */}
      {selectedIdea && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          background: 'rgba(10, 14, 20, 0.95)',
          border: '1px solid #00F0FF',
          borderRadius: '8px',
          padding: '24px',
          color: '#E6EDF3',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
          zIndex: 10,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              margin: 0,
              color: '#00F0FF',
              fontSize: '1.5rem'
            }}>
              {selectedIdea.title}
            </h2>
            <button 
              onClick={() => setSelectedIdea(null)}
              style={{
                background: 'none',
                border: '1px solid #8B949E',
                color: '#8B949E',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          <p style={{
            margin: '0 0 20px 0',
            lineHeight: '1.6',
            color: '#8B949E'
          }}>
            {selectedIdea.desc}
          </p>
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button style={{
              flex: 1,
              padding: '10px 16px',
              background: '#00F0FF',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              查看详情
            </button>
            <button style={{
              flex: 1,
              padding: '10px 16px',
              background: 'transparent',
              border: '1px solid #00F0FF',
              color: '#00F0FF',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              添加想法
            </button>
          </div>
        </div>
      )}
    </div>
  );
}