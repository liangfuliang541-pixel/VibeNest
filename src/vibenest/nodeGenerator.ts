import { CreativeNode, CreativeCategory } from './types';

/**
 * 创意节点生成器
 * 用于生成分布在3D空间中的创意节点
 */
export class NodeGenerator {
  /**
   * 生成指定数量的创意节点
   * @param count 节点数量，默认1000
   * @param radius 分布半径，默认50
   * @returns 生成的创意节点数组
   */
  static generateNodes(count: number = 1000, radius: number = 50): CreativeNode[] {
    const nodes: CreativeNode[] = [];

    for (let i = 0; i < count; i++) {
      // 在球形空间中随机生成坐标
      const phi = Math.random() * Math.PI; // 纬度角 [0, π]
      const theta = Math.random() * 2 * Math.PI; // 经度角 [0, 2π]
      const r = radius * Math.cbrt(Math.random()); // 使用立方根确保均匀分布
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      // 随机选择创意分类
      const categories = Object.values(CreativeCategory);
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      // 生成随机标题
      const titles = [
        '量子计算突破', '可持续城市设计', 'AI艺术创作', '太空探索计划',
        '生物技术创新', '虚拟现实教育', '清洁能源方案', '社会公平倡议',
        '心理健康应用', '未来交通概念', '海洋保护计划', '食物供应链革新',
        '文化传承项目', '数字隐私保护', '气候适应技术', '教育平等运动'
      ];
      
      const randomTitle = `${titles[Math.floor(Math.random() * titles.length)]} #${i}`;

      // 生成随机颜色
      const colors = ['#00F0FF', '#BD00FF', '#E6EDF3', '#8B949E', '#FF6B6B', '#4ECDC4', '#FFBE0B'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      nodes.push({
        id: i,
        position: [x, y, z],
        title: randomTitle,
        description: `这是一个关于"${randomTitle}"的创意想法，旨在改变世界。`,
        color: randomColor,
        size: 0.5 + Math.random() * 0.5, // 随机大小 0.5-1.0
        category: randomCategory,
        tags: this.generateRandomTags(),
        energy: Math.random(), // 随机能量值 0-1
        vector: [x, y, z], // 方向向量与位置相同
        metadata: {
          influence: Math.random(),
          feasibility: Math.random(),
          novelty: Math.random(),
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)) // 随机过去一年内的日期
        }
      });
    }

    return nodes;
  }

  /**
   * 生成随机标签
   * @returns 随机标签数组
   */
  private static generateRandomTags(): string[] {
    const allTags = [
      'innovation', 'future', 'tech', 'art', 'design', 'sustainability', 
      'ai', 'vr', 'social', 'environment', 'health', 'education', 'startup'
    ];
    
    const tagCount = Math.floor(Math.random() * 3) + 1; // 每个节点1-3个标签
    const selectedTags: string[] = [];
    
    for (let i = 0; i < tagCount; i++) {
      const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!selectedTags.includes(randomTag)) {
        selectedTags.push(randomTag);
      }
    }
    
    return selectedTags;
  }

  /**
   * 根据分类过滤节点
   * @param nodes 节点数组
   * @param category 分类
   * @returns 过滤后的节点数组
   */
  static filterByCategory(nodes: CreativeNode[], category: CreativeCategory): CreativeNode[] {
    return nodes.filter(node => node.category === category);
  }

  /**
   * 根据能量值排序节点
   * @param nodes 节点数组
   * @param ascending 是否升序排列
   * @returns 排序后的节点数组
   */
  static sortByEnergy(nodes: CreativeNode[], ascending: boolean = false): CreativeNode[] {
    return [...nodes].sort((a, b) => {
      const energyA = a.energy || 0;
      const energyB = b.energy || 0;
      return ascending ? energyA - energyB : energyB - energyA;
    });
  }
}