import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// --- 1. 模拟数据 (VibeNest 种子库) ---
const IDEA_TITLES = [
  "真菌城市网络", "情绪智能窗户", "流浪猫太阳能屋", 
  "噪音转电能薄膜", "反向外卖计划", "记忆气味胶囊",
  "深海塑料回收蜂群", "植物语言翻译器", "全息远程拥抱",
  "量子梦境记录仪", "生物发光路灯", "雨水音乐转化器"
];

// --- 2. 粒子核心组件 ---
const ParticleSystem = ({ onSelect }) => {
  const meshRef = useRef();
  const count = 1500; // 粒子数量
  const dummy = useMemo(() => new THREE.Object3D(), []); // 辅助计算对象

  // 初始化粒子数据 (位置、颜色、速度)
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const x = (Math.random() - 0.5) * 80; // 分布范围扩大
      const y = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      // 随机分配一个标题
      const title = IDEA_TITLES[Math.floor(Math.random() * IDEA_TITLES.length)];
      temp.push({ t, factor, speed, x, y, z, title });
    }
    return temp;
  }, []);

  // 生成颜色缓冲 (InstanceColor)
  const colorArray = useMemo(() => {
    const array = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // 随机分配青色或紫色
      color.set(Math.random() > 0.5 ? '#00F0FF' : '#BD00FF');
      color.toArray(array, i * 3);
    }
    return array;
  }, []);

  // 每一帧的动画循环
  useFrame((state) => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      let { t, speed, x, y, z } = particle;
      // 呼吸动画算法
      const s = 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * speed * 3 + t));
      
      // 更新每个实例的矩阵
      dummy.position.set(x, y, z);
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s, s, s);
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, count]}
      onClick={(e) => {
        e.stopPropagation();
        // 获取点击的粒子数据
        const instanceId = e.instanceId;
        const data = particles[instanceId];
        // 触发父组件的回调
        onSelect(data, new THREE.Vector3(data.x, data.y, data.z));
      }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'default'}
    >
      <dodecahedronGeometry args={[0.2, 0]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </dodecahedronGeometry>
      <meshStandardMaterial
        toneMapped={false}
        vertexColors
        emissive="#111"
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.8}
      />
    </instancedMesh>
  );
};

// --- 3. 相机控制器 (处理飞行逻辑) ---
const CameraController = ({ targetPosition }) => {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (targetPosition) {
      // 计算相机的新位置 (在目标前方 5 个单位)
      const offset = new THREE.Vector3(0, 0, 8);
      const newCamPos = new THREE.Vector3().copy(targetPosition).add(offset);

      // 动画 1: 移动相机
      gsap.to(camera.position, {
        x: newCamPos.x,
        y: newCamPos.y,
        z: newCamPos.z,
        duration: 1.5,
        ease: "power3.inOut"
      });

      // 动画 2: 移动焦点 (Controls Target)
      if (controls) {
        gsap.to(controls.target, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: 1.5,
          ease: "power3.inOut"
        });
      }
    }
  }, [targetPosition, camera, controls]);

  return null;
};

// --- 4. 主 UI 面板 ---
const Overlay = ({ activeData, onBack }) => {
  if (!activeData) return (
    <div style={{
      position: 'absolute', bottom: 40, left: 40, pointerEvents: 'none', color: '#E6EDF3'
    }}>
      <h1 style={{ margin: 0, fontFamily: 'serif', fontSize: '3rem' }}>VibeNest</h1>
      <p style={{ color: '#00F0FF', fontFamily: 'monospace' }}>
        CLICK A NODE TO EXPLORE IDEAS
      </p>
    </div>
  );

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, width: '400px', height: '100%',
      background: 'rgba(10, 14, 20, 0.9)', borderLeft: '1px solid #00F0FF',
      backdropFilter: 'blur(12px)', padding: '40px', color: '#E6EDF3',
      display: 'flex', flexDirection: 'column', zIndex: 10
    }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: '#8B949E', cursor: 'pointer',
        textAlign: 'left', marginBottom: '20px', fontSize: '1.2rem'
      }}>
        ← BACK TO UNIVERSE
      </button>
      <h2 style={{ color: '#00F0FF', fontFamily: 'serif', fontSize: '2rem' }}>
        {activeData.title}
      </h2>
      <div style={{ marginTop: '20px', fontFamily: 'monospace', lineHeight: 1.6, color: '#aaa' }}>
        <p>STATUS: INCUBATING</p>
        <p>ENERGY: {(activeData.speed * 1000).toFixed(2)} J</p>
        <hr style={{ borderColor: '#333', margin: '20px 0' }} />
        <p>这里是关于该创意的详细描述。AI 正在计算该创意的可行性...</p>
      </div>
      <button style={{
        marginTop: 'auto', padding: '15px', background: '#00F0FF', color: '#000',
        border: 'none', fontWeight: 'bold', cursor: 'pointer'
      }}>
        INITIATE PROJECT
      </button>
    </div>
  );
};

// --- 5. App 入口 ---
export default function App() {
  const [activeData, setActiveData] = useState(null);
  const [targetPos, setTargetPos] = useState(null);

  // 处理选中逻辑
  const handleSelect = (data, position) => {
    setActiveData(data);
    setTargetPos(position);
  };

  // 处理返回逻辑
  const handleBack = () => {
    setActiveData(null);
    setTargetPos(new THREE.Vector3(0, 0, 0)); // 让焦点稍微归位，或者可以不重置
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0A0E14' }}>
      <Canvas camera={{ position: [0, 0, 40], fov: 60 }} dpr={[1, 2]}>
        {/* 背景色与雾效 */}
        <color attach="background" args={['#0A0E14']} />
        <fog attach="fog" args={['#0A0E14', 30, 100]} />

        {/* 灯光系统 */}
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 20, 20]} intensity={1.5} color="#00F0FF" />
        <pointLight position={[-20, -20, -20]} intensity={1.5} color="#BD00FF" />

        {/* 星空背景 */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

        {/* 核心粒子 */}
        <ParticleSystem onSelect={handleSelect} />

        {/* 相机控制 (将控制器暴露给 GSAP 使用) */}
        <CameraController targetPosition={targetPos} />
        <OrbitControls makeDefault autoRotate={!activeData} autoRotateSpeed={0.5} />
      </Canvas>

      {/* UI 覆盖层 */}
      <Overlay activeData={activeData} onBack={handleBack} />
    </div>
  );
}