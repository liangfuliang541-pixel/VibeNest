import React, { useEffect, useRef, useState } from 'react';

// --- 视觉算法：根据 ID 生成稳定颜色 ---
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 85%, 65%)`; // 更明亮的论坛配色
};

// --- 核心算法：质量 = 字数权重 + 评论数权重 (讨论越多，星星越大) ---
const calculateMass = (idea) => {
  const baseSize = 4; // 基础大小
  const commentBonus = idea.comments * 3; // 每多一条评论，半径+3 (热度极具视觉冲击力)
  const contentBonus = Math.min(idea.desc.length / 100, 3); // 内容越长也有加成
  return Math.min(baseSize + commentBonus + contentBonus, 25); // 限制最大值，防止刷屏
};

// --- 宣言弹窗 (Manifesto) ---
const ManifestoModal = ({ onClose }) => (
  <div style={{
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: '600px', padding: '50px', background: 'rgba(5, 8, 12, 0.98)',
    border: '1px solid #BD00FF', borderRadius: '2px', zIndex: 50,
    boxShadow: '0 0 80px rgba(189, 0, 255, 0.2)', color: '#E6EDF3'
  }}>
    <h1 style={{ marginTop: 0, color: '#BD00FF', fontFamily: 'serif', fontSize: '2.5rem', letterSpacing: '-2px' }}>THE NEXUS</h1>
    <h3 style={{ color: '#8B949E', fontWeight: 'normal', marginBottom: '30px', fontFamily: 'monospace' }}>// 改变世界的思想孵化器</h3>
    
    <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#D0D7DE' }}>
      传统的论坛是平面的，充满噪音。VibeNest 试图构建一个<strong>“三维的思想宇宙”</strong>。
    </p>
    <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#D0D7DE' }}>
      在这里，所有的想法都是平等的星辰。但只有那些引发共鸣、激起讨论的火花，才会演变成照亮他人的恒星。
    </p>
    <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#D0D7DE' }}>
      不管你是开发者、艺术家还是梦想家，在这里投下你的种子。如果它足够伟大，整个星系都会围绕它旋转。
    </p>

    <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
      <button onClick={onClose} style={{ padding: '12px 30px', background: 'transparent', border: '1px solid #BD00FF', color: '#BD00FF', cursor: 'pointer', fontFamily: 'monospace' }}>
        OBSERVE
      </button>
      <a href="https://github.com/liangfuliang541-pixel/VibeNest/issues/new" target="_blank" rel="noreferrer" style={{ padding: '12px 30px', background: '#BD00FF', color: '#000', textDecoration: 'none', fontWeight: 'bold', fontFamily: 'monospace' }}>
        INITIATE TOPIC
      </a>
    </div>
  </div>
);

export default function App() {
  const canvasRef = useRef(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('UNIVERSE');

  // 1. 获取 GitHub 数据 (包含 comments 字段)
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/liangfuliang541-pixel/VibeNest/issues?state=all&per_page=100');
        const data = await response.json();
        const formattedIdeas = data.map(issue => ({
          title: issue.title,
          desc: issue.body || "暂无描述",
          url: issue.html_url,
          comments: issue.comments, // 获取评论数
          user: issue.user.login,   // 获取发起人
          avatar: issue.user.avatar_url, // 发起人头像
          color: stringToColor(issue.title),
          id: issue.id,
          labels: issue.labels
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

  // 2. 渲染星系
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

    // 粒子化
    const particles = ideas.map((idea) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: calculateMass(idea), // 动态大小
      color: idea.color,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      data: idea,
      angle: Math.random() * Math.PI * 2 // 自转角度
    }));

    const render = () => {
      ctx.fillStyle = '#05080C'; // 更深邃的宇宙黑
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制连线：只连接同一作者或者相似颜色的想法（模拟"圈子"）
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const opacity = (1 - dist / 200) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
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

        // 外发光 (根据评论数决定光晕大小)
        const glowSize = p.data.comments * 10; 
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        // 热度越高，光晕越强
        if (p.data.comments > 0) {
            ctx.shadowBlur = 20 + glowSize;
            ctx.shadowColor = p.color;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;

        // 如果是热门话题 (评论>0)，绘制轨道圈
        if (p.data.comments > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size + 8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,255,255,0.2)`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleClick = (e) => {
      if (view !== 'UNIVERSE') return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
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
  }, [ideas, loading, view]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#05080C' }}>
      <canvas ref={canvasRef} style={{ display: 'block', cursor: view === 'UNIVERSE' ? 'crosshair' : 'default', opacity: view === 'ABOUT' ? 0.2 : 1, transition: 'opacity 0.5s' }} />

      {/* 侧边栏 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, height: '100%', width: '60px',
        borderRight: '1px solid #1F2428', background: 'rgba(5,8,12,0.6)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0', zIndex: 20
      }}>
        <div style={{ width: '10px', height: '10px', background: '#BD00FF', borderRadius: '50%', marginBottom: '60px', boxShadow: '0 0 10px #BD00FF' }}></div>
        <button onClick={() => setView('UNIVERSE')} style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', padding: '20px', background: 'transparent', border: 'none', color: view === 'UNIVERSE' ? '#E6EDF3' : '#444', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px' }}>GALAXY</button>
        <button onClick={() => setView('ABOUT')} style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', padding: '20px', background: 'transparent', border: 'none', color: view === 'ABOUT' ? '#BD00FF' : '#444', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px', marginTop: '20px' }}>MANIFESTO</button>
      </div>

      {/* 顶部数据流 */}
      <div style={{ position: 'absolute', top: '30px', left: '90px', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'sans-serif', fontWeight: 800, letterSpacing: '-1px', color: '#E6EDF3' }}>
          VibeNest <span style={{ color: '#BD00FF' }}>.Forum</span>
        </h1>
        <div style={{ display: 'flex', gap: '20px', marginTop: '5px', fontSize: '12px', fontFamily: 'monospace', color: '#6E7681' }}>
            <span>TOPICS: {ideas.length}</span>
            <span>ACTIVE_NODES: {ideas.filter(i => i.comments > 0).length}</span>
            <span>STATUS: LISTENING</span>
        </div>
      </div>

      {/* 关于弹窗 */}
      {view === 'ABOUT' && <ManifestoModal onClose={() => setView('UNIVERSE')} />}

      {/* 话题详情卡片 */}
      {selectedIdea && view === 'UNIVERSE' && (
        <div style={{
          position: 'absolute', right: '0', top: '0', height: '100%',
          width: '450px', padding: '40px', background: 'rgba(13, 17, 23, 0.95)',
          borderLeft: `1px solid ${selectedIdea.color}`, backdropFilter: 'blur(15px)',
          color: '#E6EDF3', boxShadow: `-20px 0 50px rgba(0,0,0,0.5)`, zIndex: 30,
          transform: 'translateX(0)', transition: 'transform 0.3s'
        }}>
          {/* 发起人信息 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <img src={selectedIdea.avatar} alt="user" style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #333' }} />
            <span style={{ fontSize: '12px', color: '#8B949E', fontFamily: 'monospace' }}>@{selectedIdea.user}</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: selectedIdea.color, border: `1px solid ${selectedIdea.color}`, padding: '2px 8px', borderRadius: '10px' }}>
              #{selectedIdea.id}
            </span>
          </div>

          <h1 style={{ marginTop: 0, fontSize: '2rem', lineHeight: 1.2, color: '#E6EDF3' }}>{selectedIdea.title}</h1>
          
          {/* 热度指标 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', fontSize: '12px', color: '#8B949E', fontFamily: 'monospace' }}>
            <span style={{ color: selectedIdea.comments > 0 ? '#BD00FF' : '#555' }}>🔥 {selectedIdea.comments} DISCUSSION(S)</span>
            <span>•</span>
            <span>OPEN TOPIC</span>
          </div>

          <p style={{ lineHeight: 1.6, color: '#C9D1D9', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
            {selectedIdea.desc}
          </p>

          <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
             <a 
               href={selectedIdea.url} target="_blank" rel="noreferrer" 
               style={{ 
                 display: 'block', padding: '15px', background: selectedIdea.color, 
                 color: '#000', textAlign: 'center', textDecoration: 'none', 
                 fontWeight: 'bold', fontFamily: 'sans-serif', letterSpacing: '1px'
               }}
             >
               JOIN DISCUSSION
             </a>
          </div>
        </div>
      )}
    </div>
  );
}