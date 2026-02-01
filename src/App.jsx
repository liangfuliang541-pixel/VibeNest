import React, { useEffect, useRef, useState } from 'react';

// --- 实用算法工具 ---

// 1. 字符串转颜色 (Color Hash)：让每个标题都有固定的专属颜色
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // 使用 HSL 颜色空间，保证颜色都是明亮好看的霓虹色
  // Hue: 0-360 (由 hash 决定)
  // Saturation: 70-100% (高饱和)
  // Lightness: 60-80% (高亮度，适合黑底)
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 80%, 70%)`;
};

// 2. 计算"质量" (根据描述长度)
const calculateMass = (idea) => {
  const baseSize = 3;
  // 描述越长，星星越大，最大不超过 8
  const extraSize = Math.min((idea.desc.length / 50), 5); 
  return baseSize + extraSize;
};

export default function App() {
  const canvasRef = useRef(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 从 GitHub 抓取数据
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/liangfuliang541-pixel/VibeNest/issues');
        const data = await response.json();
        
        // 数据清洗与预处理
        const formattedIdeas = data.map(issue => ({
          title: issue.title,
          desc: issue.body || "暂无详细描述",
          url: issue.html_url,
          // 预先计算好颜色，避免渲染时重复计算
          color: stringToColor(issue.title),
          id: issue.id
        }));
        
        setIdeas(formattedIdeas);
        setLoading(false);
      } catch (error) {
        console.error("抓取失败:", error);
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  // 2. 渲染星系
  useEffect(() => {
    // 如果没有数据，且不在加载中，就不渲染（或者渲染空状态）
    if (ideas.length === 0 && !loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // 生成粒子：位置随机，但颜色和大小由数据决定
    const particles = ideas.map((idea) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: calculateMass(idea), // 动态大小
      color: idea.color,         // 专属颜色
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      data: idea,
      pulse: Math.random() * Math.PI // 呼吸闪烁相位
    }));

    const render = () => {
      // 1. 绘制背景 (带一点点拖影效果，制造流光感)
      ctx.fillStyle = 'rgba(10, 14, 20, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        // 运动
        p.x += p.speedX;
        p.y += p.speedY;

        // 边界回弹
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        // 呼吸效果计算
        p.pulse += 0.05;
        const glow = 10 + Math.sin(p.pulse) * 5; // 光晕在 5-15 之间波动

        // 绘制
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // 核心颜色
        ctx.fillStyle = p.color;
        
        // 动态光晕 (关键视觉优化)
        ctx.shadowBlur = glow;
        ctx.shadowColor = p.color;
        
        ctx.fill();
        ctx.shadowBlur = 0; // 重置以免影响下一帧性能
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // 点击交互
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 扩大点击判定范围，让手指/鼠标更容易点中
      const clicked = particles.find(p => {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        return Math.sqrt(dx * dx + dy * dy) < (p.size + 15);
      });

      if (clicked) setSelectedIdea(clicked.data);
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ideas, loading]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0A0E14' }}>
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'pointer' }} />
      
      {/* 顶部标题 */}
      <div style={{ position: 'absolute', top: '40px', left: '40px', color: '#E6EDF3', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontFamily: 'serif', letterSpacing: '-1px' }}>VibeNest</h1>
        <p style={{ color: '#8B949E', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {loading ? "LINKING TO GITHUB..." : `:: SYNCED ${ideas.length} NODES ::`}
        </p>
      </div>

      {/* 详情弹窗 (极简风格) */}
      {selectedIdea && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '380px', padding: '30px', 
          background: 'rgba(13, 17, 23, 0.95)', // GitHub Dark Dimmed 风格
          border: `1px solid ${selectedIdea.color}`, // 边框颜色跟随星星颜色
          borderRadius: '12px', backdropFilter: 'blur(12px)',
          color: '#E6EDF3', boxShadow: `0 0 50px ${selectedIdea.color}40` // 柔和的彩色阴影
        }}>
          {/* 装饰性标题头 */}
          <div style={{ fontSize: '0.7rem', color: selectedIdea.color, marginBottom: '10px', fontFamily: 'monospace' }}>
            ID: #{selectedIdea.id} // SECURE_ASSET
          </div>
          
          <h2 style={{ marginTop: 0, fontSize: '1.5rem', lineHeight: '1.3' }}>{selectedIdea.title}</h2>
          
          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>
          
          <p style={{ lineHeight: 1.6, color: '#8B949E', fontSize: '0.95rem' }}>{selectedIdea.desc}</p>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
            <button 
              onClick={() => setSelectedIdea(null)}
              style={{ flex: 1, background: 'transparent', border: '1px solid #30363D', color: '#8B949E', padding: '12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              关闭信号
            </button>
            <a 
              href={selectedIdea.url} target="_blank" rel="noreferrer"
              style={{ 
                flex: 1, background: selectedIdea.color, color: '#000', 
                textAlign: 'center', padding: '12px', textDecoration: 'none', 
                fontWeight: 'bold', borderRadius: '6px', fontSize: '0.9rem'
              }}
            >
              进入讨论区
            </a>
          </div>
        </div>
      )}

      {/* 底部品牌水印 */}
      <div style={{ position: 'absolute', bottom: '20px', left: '40px', color: '#8B949E', opacity: 0.5, fontSize: '12px' }}>
        福建省小南同学网络科技有限公司 | VibeNest OS v1.1
      </div>
    </div>
  );
}