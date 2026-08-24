export type TrackId =
  | 'ai-fullstack'
  | 'ai-algorithm'
  | 'data-analysis'
  | 'cybersecurity'

export interface TrackDefinition {
  id: TrackId
  index: number
  code: string
  name: string
  english: string
  shortName: string
  accent: string
  eligibility: string
  restricted: boolean
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
    code: 'SYIT-AF',
    name: 'AI 全栈开发',
    english: 'AI FULL-STACK',
    shortName: 'AI 全栈',
    accent: '#EE8B1F',
    eligibility: '仅限计算机、电子信息相关专业',
    restricted: true,
    hardware: '常规设备即可',
    summary: '面向大模型应用与多端产品的工程实践方向，从前端页面到后端服务、从 AI 艺术到桌面应用全链路亲手实现。',
    modules: [
      '大模型工程',
      'RAG',
      'Agent',
      'Web 前后端',
      '安卓应用',
      '桌面应用',
      'AI 艺术',
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
    code: 'SYIT-AL',
    name: '人工智能算法',
    english: 'AI ALGORITHM',
    shortName: 'AI 算法',
    accent: '#4B7DB0',
    eligibility: '不限专业',
    restricted: false,
    hardware: '需要英伟达独立显卡',
    summary: '聚焦深度学习、计算机视觉与机器博弈的进阶训练，并延伸至强化学习前沿。',
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
    code: 'SYIT-DA',
    name: '数据分析',
    english: 'DATA ANALYSIS',
    shortName: '数据分析',
    accent: '#3D8C7E',
    eligibility: '不限专业',
    restricted: false,
    hardware: '常规设备即可',
    summary: '覆盖数据清洗、可视化、机器学习与数学建模的完整方法链路，用数据讲出有说服力的故事。',
    modules: ['数据清洗', '可视化', '机器学习', '深度学习', '数学建模'],
    competitions: [
      '长风杯',
      '全球校园人工智能算法大赛',
      '数学建模等数据类竞赛',
    ],
  },
  {
    id: 'cybersecurity',
    index: 4,
    code: 'SYIT-SC',
    name: '网络安全',
    english: 'CYBERSECURITY',
    shortName: '网安',
    accent: '#D84B3A',
    eligibility: '仅限计算机、电子信息相关专业',
    restricted: true,
    hardware: '常规设备即可',
    summary: '从协议栈到攻防对抗，以白帽视角理解系统、发现漏洞并构建防线，走向 CTF 竞技场。',
    modules: ['计算机网络', 'Web 安全', '渗透测试', 'Yakit', 'Kali Linux', 'CTF 入门'],
    competitions: ['CTF 网络安全竞赛', '信息安全类大赛等'],
  },
]

export function getTrackById(id: string): TrackDefinition | undefined {
  return tracks.find((track) => track.id === id)
}

export const recruitmentNotes = [
  '可报名多个方向，但需理性评估精力，建议主攻一至两个。',
  '正式分组在开学第一次社团招新结束之后确认。',
  '实习成员可提前学习对应方向，新成员后续统一确认。',
] as const

export const associationMeta = {
  name: '沈阳理工大学计算机协会',
  recruitment: '2026 招新',
  qqGroup: '1081018272',
} as const
