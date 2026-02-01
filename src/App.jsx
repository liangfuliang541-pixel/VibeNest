import React, { useEffect, useRef, useState } from 'react';

// --- 工具函数 ---
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 80%, 70%)`;
};

const calculateMass = (idea) => Math.min((idea.desc.length / 50) + 3, 8);

// --- 子组件：关于我们弹窗 ---
const ManifestoModal = ({ onClose }) => (
  <div style={{
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: '500px', padding: '40px', background: 'rgba(13, 17, 23, 0.98)',
    border: '1px solid #00F0FF', borderRadius: '16px', zIndex: 50,
    boxShadow: '0 0 100px rgba(0, 240, 255, 0.1)', color: '#E6EDF3'
  }}>
    <h2 style={{ marginTop: 0, color: '#00F0FF', fontFamily: 'serif', fontSize: '2rem' }}>小南同学</h2>
    <h3 style={{ color: '#8B949E', fontWeight: 'normal', marginBottom: '30px' }}>福建省小南同学网络科技有限公司</h3>
    
    <p style={{ lineHeight: 1.8, fontSize: '1rem', color: '#D0D7DE' }}>
      我们致力于捕捉那些稍纵即逝的微小念头。VibeNest (氛围巢穴) 是我们的第一个实验性项目，
      旨在通过可视化的方式，让孤立的创意在数字宇宙中寻找共鸣。
    </p>
    <p style={{ lineHeight: 1.8, fontSize: '1rem', color: '#D0D7DE' }}>
      每一颗你看到的星辰，都是来自 GitHub 开源社区的真实声音。我们相信，技术应当服务于连接，
      而不仅仅是计算。
    </p>

    <div style={{ marginTop: '40px', textAlign: 'right' }}>
      <button 
        onClick={onClose}
        style={{ padding: '10px 30px', background: '#00F0FF', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
      >
        进入星系
      </button>
    </div>
  </div>
);

// --- 主程序 ---
export default function App() {
  const canvasRef = useRef(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('UNIVERSE'); // 'UNIVERSE' | 'ABOUT'

  // 1. 数据抓取
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/liangfuliang541-pixel/VibeNest/issues');
        const data = await response.json();
        const formattedIdeas = data.map(issue => ({
          title: issue.title,
          desc: issue.body || "暂无详细描述",
          url: issue.html_url,
          color: stringToColor(issue.title),
          id: issue.id
        }));
        setIdeas(formattedIdeas);
        setLoading(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        setLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  // 2. 渲染循环 (含连线逻辑)
  useEffect(() => {
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

    // 初始化粒子
    const particles = ideas.map((idea) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: calculateMass(idea),
      color: idea.color,
      speedX: (Math.random() - 0.5) * 0.5, // 速度放慢，方便观察连线
      speedY: (Math.random() - 0.5) * 0.5,
      data: idea
    }));

    const render = () => {
      // 深空背景
      ctx.fillStyle = '#0A0E14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- 核心升级：绘制连线 (Constellations) ---
      // 双重循环检查距离，如果足够近就画线
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // 连线阈值：150px 以内连接
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // 线条透明度随距离变化：越近越亮
            const opacity = 1 - (distance / 150);
            ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.2})`; // 微弱的青色连接线
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // 绘制粒子
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleClick = (e) => {
      if (view !== 'UNIVERSE') return; // 关于页面时不处理Canvas点击
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const clicked = particles.find(p => {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        return Math.sqrt(dx * dx + dy * dy) < (p.size + 10);
      });

      if (clicked) setSelectedIdea(clicked.data);
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ideas, loading, view]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0A0E14' }}>
      
      {/* 1. 核心画布 */}
      <canvas ref={canvasRef} style={{ display: 'block', cursor: view === 'UNIVERSE' ? 'pointer' : 'default', opacity: view === 'ABOUT' ? 0.3 : 1, transition: 'opacity 0.5s' }} />

      {/* 2. 侧边栏导航 (Mission Control) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, height: '100%', width: '80px',
        borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,14,20,0.8)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', zIndex: 20
      }}>
        {/* Logo 区 */}
        <div style={{ width: '40px', height: '40px', background: '#00F0FF', borderRadius: '50%', marginBottom: '40px', boxShadow: '0 0 15px #00F0FF' }}></div>
        
        {/* 导航按钮 */}
        <button 
          onClick={() => setView('UNIVERSE')}
          style={{ writingMode: 'vertical-lr', padding: '20px 10px', background: 'transparent', border: 'none', color: view === 'UNIVERSE' ? '#00F0FF' : '#555', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '4px', borderLeft: view === 'UNIVERSE' ? '2px solid #00F0FF' : 'none' }}
        >
          GALAXY
        </button>
        <button 
          onClick={() => setView('ABOUT')}
          style={{ writingMode: 'vertical-lr', padding: '20px 10px', background: 'transparent', border: 'none', color: view === 'ABOUT' ? '#00F0FF' : '#555', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '4px', borderLeft: view === 'ABOUT' ? '2px solid #00F0FF' : 'none', marginTop: '20px' }}
        >
          ABOUT
        </button>
      </div>

      {/* 3. 页面标题 */}
      <div style={{ position: 'absolute', top: '30px', left: '120px', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontFamily: 'serif', color: '#E6EDF3' }}>VibeNest <span style={{fontSize: '0.8rem', color: '#00F0FF', verticalAlign: 'top'}}>v2.0</span></h1>
        <p style={{ color: '#8B949E', fontSize: '0.8rem', letterSpacing: '1px' }}>
          {loading ? "ESTABLISHING UPLINK..." : `NEURAL LINK ACTIVE: ${ideas.length} NODES`}
        </p>
      </div>

      {/* 4. 内容层：关于我们 */}
      {view === 'ABOUT' && <ManifestoModal onClose={() => setView('UNIVERSE')} />}

      {/* 5. 内容层：创意详情 */}
      {selectedIdea && view === 'UNIVERSE' && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '400px', padding: '30px', background: 'rgba(22, 27, 34, 0.95)',
          border: `1px solid ${selectedIdea.color}`, borderRadius: '12px', backdropFilter: 'blur(10px)',
          color: '#E6EDF3', boxShadow: `0 0 50px ${selectedIdea.color}20`, zIndex: 30
        }}>
          <h2 style={{ marginTop: 0, color: selectedIdea.color }}>{selectedIdea.title}</h2>
          <p style={{ lineHeight: 1.6, color: '#8B949E' }}>{selectedIdea.desc}</p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
             <button onClick={() => setSelectedIdea(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #555', color: '#888', cursor: 'pointer' }}>Close</button>
             <a href={selectedIdea.url} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '10px', background: selectedIdea.color, color: '#000', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold' }}>GitHub</a>
          </div>
        </div>
      )}
    </div>
  );
}