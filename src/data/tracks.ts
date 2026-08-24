export type TrackId =
  | 'ai-fullstack'
  | 'ai-algorithm'
  | 'data-analysis'
  | 'cybersecurity'

export interface TrackDefinition {
  id: TrackId
  index: number
  name: string
  shortName: string
  accent: string
  eligibility: string
  hardware: string
  summary: string
  modules: readonly string[]
  competitions: readonly string[]
  projectOpportunity?: readonly string[]
}

export const tracks: readonly TrackDefinition[] = [
  {
    id: 'ai-fullstack',
    index: 1,
    name: 'AI 全栈开发',
    shortName: 'AI 全栈',
    accent: '#0EA5E9',
    eligibility: '仅限计算机、电子信息相关专业',
    hardware: '未特别说明',
    summary: '面向大模型应用与多端产品开发的工程实践方向。',
    modules: [
      '大模型工程',
      'RAG',
      'Agent',
      'Web 前后端开发',
      '安卓应用开发',
      '电脑应用开发',
      'AI 艺术制作',
    ],
    competitions: ['中国高校计算机大赛、软件杯等应用类竞赛'],
    projectOpportunity: [
      '第一学期末择优 1 名参与沈理校园 live 项目',
      '第二学期考核后开放第 2 个名额，可能视实际增加',
    ],
  },
  {
    id: 'ai-algorithm',
    index: 2,
    name: '人工智能算法',
    shortName: 'AI 算法',
    accent: '#8B5CF6',
    eligibility: '不限专业',
    hardware: '需要英伟达独立显卡',
    summary: '聚焦深度学习与智能决策算法的进阶训练。',
    modules: ['深度学习', '计算机视觉', '机器博弈', '强化学习进阶'],
    competitions: [
      '计算机视觉相关赛道',
      '腾讯开悟人工智能大赛',
      '计算机博弈大赛等',
    ],
  },
  {
    id: 'data-analysis',
    index: 3,
    name: '数据分析',
    shortName: '数据分析',
    accent: '#F59E0B',
    eligibility: '不限专业',
    hardware: '未特别说明',
    summary: '覆盖从数据处理到建模分析的完整方法链路。',
    modules: ['数据清洗', '可视化', '机器学习', '深度学习', '建模'],
    competitions: [
      '长风杯',
      '全球校园人工智能算法大赛',
      '数学建模等数据分析类竞赛',
    ],
  },
  {
    id: 'cybersecurity',
    index: 4,
    name: '网络安全',
    shortName: '网安',
    accent: '#EF4444',
    eligibility: '仅限计算机、电子信息相关专业',
    hardware: '未特别说明',
    summary: '学习网络基础与常用安全工具的实战使用。',
    modules: ['计算机网络', '安全工具使用', 'Yakit', 'Kali'],
    competitions: ['网络安全类竞赛'],
  },
]

export function getTrackById(id: string): TrackDefinition | undefined {
  return tracks.find((track) => track.id === id)
}

export const recruitmentNotes = [
  '可报名多个方向，但需理性评估精力。',
  '正式分组在开学第一次社团招新结束之后。',
  '实习成员可提前学习对应方向，新成员后续统一确认。',
] as const

export const associationMeta = {
  name: '沈阳理工大学计算机协会',
  recruitment: '2026 招新',
  qqGroup: '1081018272',
} as const
