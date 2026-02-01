/**
 * VibeNest 创意节点数据结构定义
 * 定义创意节点的数据模型，包含ID、标题、描述、3D位置等属性
 */

export interface CreativeNode {
  id: number;
  position: [number, number, number]; // 3D坐标 [x, y, z]
  title: string; // 创意标题
  description?: string; // 创意描述
  color?: string; // 粒子颜色
  size?: number; // 粒子大小
  category?: string; // 创意分类
  tags?: string[]; // 标签数组
  energy?: number; // 当前受欢迎程度，影响发光强度
  vector?: number[]; // 用于连接相关创意的向量
  metadata?: {
    influence?: number; // 影响力评分 (0-1)
    feasibility?: number; // 可行性评分 (0-1)
    novelty?: number; // 新颖度评分 (0-1)
    timestamp?: Date; // 创建时间戳
  };
}

// 创意节点分类枚举
export enum CreativeCategory {
  TECHNOLOGY = 'technology',
  ART = 'art',
  DESIGN = 'design',
  SCIENCE = 'science',
  BUSINESS = 'business',
  SOCIAL = 'social',
  ENVIRONMENT = 'environment',
  EDUCATION = 'education',
  HEALTH = 'health',
  OTHER = 'other'
}

// 交互事件类型
export type InteractionEvent = {
  type: 'hover' | 'click' | 'doubleClick';
  nodeId: number;
  position?: [number, number, number];
};