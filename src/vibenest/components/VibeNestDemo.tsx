import React, { useState, useEffect } from 'react';
import VibeNestScene from './VibeNestScene';
import { NodeGenerator } from '../nodeGenerator';
import { CreativeNode, CreativeCategory } from '../types';
import '../styles/VibeNestDemo.css';

const VibeNestDemo: React.FC = () => {
  const [nodes, setNodes] = useState<CreativeNode[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<CreativeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CreativeNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CreativeCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 初始化创意节点
  useEffect(() => {
    setIsLoading(true);
    // 使用setTimeout模拟加载过程
    setTimeout(() => {
      const generatedNodes = NodeGenerator.generateNodes(1000, 50);
      setNodes(generatedNodes);
      setFilteredNodes(generatedNodes);
      setIsLoading(false);
    }, 500);
  }, []);

  // 根据分类和搜索词过滤节点
  useEffect(() => {
    let result = [...nodes];

    // 按分类过滤
    if (categoryFilter !== 'all') {
      result = NodeGenerator.filterByCategory(result, categoryFilter);
    }

    // 按搜索词过滤
    if (searchTerm) {
      result = result.filter(node =>
        node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.description && node.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        node.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredNodes(result);
  }, [categoryFilter, searchTerm, nodes]);

  // 处理节点选择
  const handleNodeSelect = (node: CreativeNode) => {
    setSelectedNode(node);
  };

  // 获取分类颜色
  const getCategoryColor = (category: string | undefined) => {
    if (!category) return '#8B949E';
    
    const colorMap: Record<string, string> = {
      technology: '#00F0FF',
      art: '#BD00FF',
      design: '#FF6B6B',
      science: '#4ECDC4',
      business: '#FFBE0B',
      social: '#9B5DE5',
      environment: '#00BB9D',
      education: '#F15BB5',
      health: '#FEE440',
      other: '#8B949E'
    };

    return colorMap[category] || '#8B949E';
  };

  return (
    <div className="vibenest-container">
      {/* 顶部导航栏 */}
      <header className="vibenest-header">
        <div className="logo">
          <h1>VibeNest</h1>
          <p>记录足以改变世界的微小念头</p>
        </div>
        
        <div className="controls">
          <input
            type="text"
            placeholder="搜索创意..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CreativeCategory | 'all')}
            className="category-select"
          >
            <option value="all">所有分类</option>
            {Object.entries(CreativeCategory).map(([key, value]) => (
              <option key={value} value={value}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="vibenest-main">
        {/* 左侧信息面板 */}
        <aside className="info-panel">
          <div className="panel-content">
            <h2>创意宇宙</h2>
            
            <div className="stats">
              <div className="stat-item">
                <span className="stat-label">总创意数</span>
                <span className="stat-value">{nodes.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">已筛选</span>
                <span className="stat-value">{filteredNodes.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">活跃分类</span>
                <span className="stat-value">
                  {categoryFilter === 'all' ? '全部' : categoryFilter}
                </span>
              </div>
            </div>

            {selectedNode && (
              <div className="selected-node-info">
                <h3>{selectedNode.title}</h3>
                <p className="node-description">{selectedNode.description}</p>
                
                <div className="node-meta">
                  <div className="meta-item">
                    <span className="meta-label">分类:</span>
                    <span 
                      className="meta-value category-badge"
                      style={{ backgroundColor: getCategoryColor(selectedNode.category) }}
                    >
                      {selectedNode.category}
                    </span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-label">能量值:</span>
                    <span className="meta-value">{(selectedNode.energy || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-label">新颖度:</span>
                    <span className="meta-value">{((selectedNode.metadata?.novelty || 0) * 100).toFixed(0)}%</span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-label">可行性:</span>
                    <span className="meta-value">{((selectedNode.metadata?.feasibility || 0) * 100).toFixed(0)}%</span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-label">影响力:</span>
                    <span className="meta-value">{((selectedNode.metadata?.influence || 0) * 100).toFixed(0)}%</span>
                  </div>
                </div>
                
                {selectedNode.tags && selectedNode.tags.length > 0 && (
                  <div className="tags-section">
                    <span className="meta-label">标签:</span>
                    <div className="tags-list">
                      {selectedNode.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!selectedNode && (
              <div className="placeholder-text">
                <p>在3D宇宙中点击一个创意节点以查看详情</p>
                <ul>
                  <li>• 悬停查看创意预览</li>
                  <li>• 点击聚焦特定创意</li>
                  <li>• 双击返回初始视角</li>
                </ul>
              </div>
            )}
          </div>
        </aside>

        {/* 3D场景 */}
        <div className="scene-container">
          {isLoading ? (
            <div className="loading-spinner">加载创意宇宙中...</div>
          ) : (
            <VibeNestScene nodes={filteredNodes} />
          )}
        </div>
      </main>

      {/* 底部信息栏 */}
      <footer className="vibenest-footer">
        <div className="footer-content">
          <p>VibeNest - 收集人类微小创意并推动其改变世界的平台</p>
          <p>公益为主，微利维持 | 技术极客 & 艺术家</p>
        </div>
      </footer>
    </div>
  );
};

export default VibeNestDemo;