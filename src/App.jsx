import React, { useEffect, useRef, useState } from 'react';

// --- 工具：哈希颜色生成 ---
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 85%, 65%)`; 
};

// --- 工具：质量计算 ---
const calculateMass = (idea) => {
  const baseSize = 4;
  const commentBonus = idea.comments * 3; 
  return Math.min(baseSize + commentBonus, 25);
};

// --- 音频引擎组件 ---
const AmbientSound = ({ active }) => {
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    if (active) {
      // 初始化音频上下文
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      
      // 创建振荡器 (生成深空低频噪音)
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, audioCtxRef.current.currentTime); // 50Hz 低频
      
      // 动态音量 (呼吸感)
      gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);
      
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } else {
      if (audioCtxRef.current) audioCtxRef.current.close();
    }

    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [active]);

  return null;
};

// --- 详情弹窗 (含评论流) ---
const DetailModal = ({ idea, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  // 实时抓取该 Issue 的具体评论
  useEffect(() => {
    if (idea.comments === 0) {
      setLoadingComments(false);
      return;
    }
    const fetchComments = async () => {
      try {
        const res = await fetch(idea.comments_url);
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [idea]);

  return (
    <div style={{
      position: 'absolute', right: '0', top: '0', height: '100%',
      width: '500px', padding: '40px', background: 'rgba(5, 8, 12, 0.95)',
      borderLeft: `1px solid ${idea.color}`, backdropFilter: 'blur(20px)',
      color: '#E6EDF3', boxShadow: `-20px 0 80px rgba(0,0,0,0.8)`, zIndex: 100,
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <span style={{ fontFamily: 'monospace', color: idea.color, border: `1px solid ${idea.color}`, padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
          NODE ID: #{idea.id}
        </span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '20px' }}>×</button>
      </div>

      <h1 style={{ marginTop: 0, fontSize: '2rem', lineHeight: 1.2, color: '#fff', textShadow: `0 0 20px ${idea.color}40` }}>{idea.title}</h1>
      
      <div style={{ margin: '30px 0', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: `4px solid ${idea.color}` }}>
        <p style={{ lineHeight: 1.8, color: '#C9D1D9', fontSize: '1.05rem', whiteSpace: 'pre-wrap', margin: 0 }}>
          {idea.desc}
        </p>
      </div>

      {/* 评论区 (论坛核心) */}
      <h3 style={{ color: '#BD00FF', fontFamily: 'monospace', marginTop: '40px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        // SIGNAL TRANSMISSIONS ({idea.comments})
      </h3>

      {loadingComments ? (
        <p style={{ color: '#666', fontFamily: 'monospace' }}>Decryping signals...</p>
      ) : comments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '15px' }}>
               <img src={c.user.avatar_url} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
               <div>
                 <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>@{c.user.login}</div>
                 <div style={{ color: '#D0D7DE', fontSize: '0.95rem', lineHeight: '1.5', background: '#161B22', padding: '10px', borderRadius: '0 10px 10px 10px' }}>
                   {c.body}
                 </div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#444' }}>
          <p>暂无信号回传。</p>
          <a href={idea.url} target="_blank" rel="noreferrer" style={{ color: '#BD00FF' }}>成为第一个发送信号的人</a>
        </div>
      )}

      {/* 底部按钮 */}
      <div style={{ marginTop: '50px' }}>
        <a href={idea.url} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '15px', background: idea.color, color: '#000', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold', borderRadius: '4px' }}>
          加入讨论 (GitHub)
        </a>
      </div>
    </div>
  );
};

export default function App() {
  const canvasRef = useRef(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. 获取 GitHub 数据
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/liangfuliang541-pixel/VibeNest/issues?state=all&per_page=100');
        const data = await response.json();
        const formattedIdeas = data.map(issue => ({
          title: issue.title,
          desc: issue.body || "暂无描述",
          url: issue.html_url,
          comments_url: issue.comments_url, // 评论 API 地址
          comments: issue.comments, 
          user: issue.user.login,
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

  // 2. 鼠标监听 (视差效果)
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3. 渲染星系
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

    const particles = ideas.map((idea) => ({
      // 基础位置
      baseX: Math.random() * canvas.width,
      baseY: Math.random() * canvas.height,
      // 深度 (Z轴模拟)，0.5-2.0，越小越远，动得越慢
      depth: Math.random() * 1.5 + 0.5, 
      size: calculateMass(idea),
      color: idea.color,
      data: idea,
      angle: Math.random() * Math.PI * 2
    }));

    const render = () => {
      ctx.fillStyle = '#05080C'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 视差偏移量
      const parallaxX = mousePos.x * 50; 
      const parallaxY = mousePos.y * 50;

      // 绘制连线
      particles.forEach((p1, i) => {
        // 计算这一帧的实际位置 (带视差)
        const p1x = p1.baseX - (parallaxX * p1.depth);
        const p1y = p1.baseY - (parallaxY * p1.depth);

        particles.slice(i + 1).forEach(p2 => {
          const p2x = p2.baseX - (parallaxX * p2.depth);
          const p2y = p2.baseY - (parallaxY * p2.depth);
          
          const dx = p1x - p2x;
          const dy = p1y - p2y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(p1x, p1y);
            ctx.lineTo(p2x, p2y);
            const opacity = (1 - dist / 200) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.stroke();
          }
        });
      });

      // 绘制粒子
      particles.forEach(p => {
        // 更新位置 (简单的漂浮动画 + 视差)
        p.baseX += Math.sin(p.angle) * 0.2;
        p.baseY += Math.cos(p.angle) * 0.2;
        p.angle += 0.01;

        // 边界循环
        if (p.baseX < -50) p.baseX = canvas.width + 50;
        if (p.baseX > canvas.width + 50) p.baseX = -50;
        if (p.baseY < -50) p.baseY = canvas.height + 50;
        if (p.baseY > canvas.height + 50) p.baseY = -50;

        // 最终渲染坐标
        const renderX = p.baseX - (parallaxX * p.depth);
        const renderY = p.baseY - (parallaxY * p.depth);

        const glowSize = p.data.comments * 8; 
        
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        if (p.data.comments > 0) {
            ctx.shadowBlur = 15 + glowSize;
            ctx.shadowColor = p.color;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;

        // 热门话题轨道
        if (p.data.comments > 0) {
            ctx.beginPath();
            ctx.arc(renderX, renderY, p.size + 10, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,255,255,0.1)`;
            ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const parallaxX = mousePos.x * 50;
      const parallaxY = mousePos.y * 50;

      const clicked = particles.find(p => {
        // 点击检测也需要计算视差后的位置
        const renderX = p.baseX - (parallaxX * p.depth);
        const renderY = p.baseY - (parallaxY * p.depth);
        const dx = renderX - clickX;
        const dy = renderY - clickY;
        return Math.sqrt(dx * dx + dy * dy) < (p.size + 20);
      });
      if (clicked) setSelectedIdea(clicked.data);
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ideas, loading, mousePos]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#05080C' }}>
      
      <AmbientSound active={audioEnabled} />
      
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'pointer' }} />

      {/* 顶部栏 */}
      <div style={{ position: 'absolute', top: '30px', left: '40px', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'sans-serif', fontWeight: 800, letterSpacing: '-1px', color: '#E6EDF3' }}>
          VibeNest <span style={{ color: '#BD00FF' }}>.Singularity</span>
        </h1>
        
        <div style={{ display: 'flex', gap: '15px', fontSize: '12px', fontFamily: 'monospace', color: '#6E7681' }}>
          <span>TOPICS: {ideas.length}</span>
          <span>ACTIVE: {ideas.filter(i => i.comments > 0).length}</span>
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{ 
              background: audioEnabled ? '#BD00FF' : 'transparent', 
              border: '1px solid #BD00FF', 
              color: audioEnabled ? '#000' : '#BD00FF',
              padding: '4px 10px', 
              cursor: 'pointer', 
              fontFamily: 'monospace',
              borderRadius: '4px'
            }}
          >
            {audioEnabled ? '🔇 MUTE' : '🔊 SOUND'}
          </button>
        </div>
      </div>

      {/* 详情弹窗 */}
      {selectedIdea && <DetailModal idea={selectedIdea} onClose={() => setSelectedIdea(null)} />}
    </div>
  );
}