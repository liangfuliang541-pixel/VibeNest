import React, { useEffect, useRef, useState } from 'react';

export default function App() {
  const canvasRef = useRef(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideas, setIdeas] = useState([]); // 存储从 GitHub 抓取的真实数据
  const [loading, setLoading] = useState(true);

  // 1. 从 GitHub 抓取数据
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        // 访问你刚刚打通的仓库数据
        const response = await fetch('https://api.github.com/repos/liangfuliang541-pixel/VibeNest/issues');
        const data = await response.json();
        
        // 格式化数据：过滤掉掉不需要的信息，只留标题和内容
        const formattedIdeas = data.map(issue => ({
          title: issue.title,
          desc: issue.body || "暂无详细描述",
          url: issue.html_url
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

  // 2. 渲染星系 (Canvas 逻辑)
  useEffect(() => {
    if (ideas.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // 根据抓取到的创意数量生成粒子
    const particles = ideas.map((idea) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 5,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5,
      data: idea
    }));

    const render = () => {
      ctx.fillStyle = '#0A0E14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00F0FF';
        ctx.fillStyle = '#00F0FF';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const clicked = particles.find(p => {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        return Math.sqrt(dx * dx + dy * dy) < 20;
      });

      if (clicked) setSelectedIdea(clicked.data);
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ideas]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0A0E14' }}>
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'pointer' }} />
      
      {/* 顶部标题 */}
      <div style={{ position: 'absolute', top: '40px', left: '40px', color: '#E6EDF3', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontFamily: 'serif' }}>VibeNest</h1>
        <p style={{ color: '#00F0FF', fontFamily: 'monospace' }}>
          {loading ? "[ 正在同步云端灵感... ]" : `[ 成功同步 ${ideas.length} 颗灵感星子 ]`}
        </p>
      </div>

      {/* 详情弹窗 */}
      {selectedIdea && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '350px', padding: '30px', background: 'rgba(22, 27, 34, 0.95)',
          border: '1px solid #00F0FF', borderRadius: '8px', backdropFilter: 'blur(10px)',
          color: '#E6EDF3', boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)'
        }}>
          <h2 style={{ color: '#00F0FF', marginTop: 0 }}>{selectedIdea.title}</h2>
          <p style={{ lineHeight: 1.6, color: '#8B949E' }}>{selectedIdea.desc}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={() => setSelectedIdea(null)}
              style={{ flex: 1, background: 'transparent', border: '1px solid #8B949E', color: '#8B949E', padding: '10px', cursor: 'pointer' }}
            >
              返回星系
            </button>
            <a 
              href={selectedIdea.url} target="_blank" rel="noreferrer"
              style={{ flex: 1, background: '#00F0FF', color: '#000', textAlign: 'center', padding: '10px', textDecoration: 'none', fontWeight: 'bold' }}
            >
              去 GitHub 讨论
            </a>
          </div>
        </div>
      )}

      {/* 页脚信息 */}
      <div style={{ position: 'absolute', bottom: '20px', left: '40px', color: '#8B949E', fontSize: '12px' }}>
        © 2026 福建省小南同学网络科技有限公司 | 开发发起人: Liangfu Liang
      </div>
    </div>
  );
}