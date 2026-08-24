import {
  associationMeta,
  getTrackById,
  recruitmentNotes,
  tracks,
} from './tracks'

describe('tracks', () => {
  it('按照招新页面顺序提供四个方向', () => {
    expect(tracks.map((track) => track.id)).toEqual([
      'ai-fullstack',
      'ai-algorithm',
      'data-analysis',
      'cybersecurity',
    ])
  })

  it('限制 AI 全栈开发与网络安全的报名专业', () => {
    expect(getTrackById('ai-fullstack')?.eligibility).toBe(
      '仅限计算机、电子信息相关专业',
    )
    expect(getTrackById('cybersecurity')?.eligibility).toBe(
      '仅限计算机、电子信息相关专业',
    )
    expect(getTrackById('ai-fullstack')?.restricted).toBe(true)
    expect(getTrackById('cybersecurity')?.restricted).toBe(true)
  })

  it('AI 算法与数据分析不做专业限制', () => {
    expect(getTrackById('ai-algorithm')?.eligibility).toBe('不限专业')
    expect(getTrackById('data-analysis')?.eligibility).toBe('不限专业')
    expect(getTrackById('ai-algorithm')?.restricted).toBe(false)
    expect(getTrackById('data-analysis')?.restricted).toBe(false)
  })

  it('说明人工智能算法方向需要英伟达独立显卡', () => {
    expect(getTrackById('ai-algorithm')?.hardware).toBe(
      '需要英伟达独立显卡',
    )
  })

  it('列出 AI 全栈开发项目机会的两个阶段', () => {
    expect(getTrackById('ai-fullstack')?.projectOpportunity).toEqual([
      '第一学期末择优 1 名参与沈理校园 live 项目',
      '第二学期考核后开放第 2 个名额，可能视实际增加',
    ])
  })

  it('按有效 id 返回方向定义', () => {
    const track = getTrackById('data-analysis')

    expect(track).toMatchObject({
      id: 'data-analysis',
      name: '数据分析',
    })
  })

  it('对无效 id 返回 undefined', () => {
    expect(getTrackById('design')).toBeUndefined()
  })
})

describe('recruitmentNotes', () => {
  it('保留三条统一招新说明', () => {
    expect(recruitmentNotes).toEqual([
      '可报名多个方向，但需理性评估精力，建议主攻一至两个。',
      '正式分组在开学第一次社团招新结束之后确认。',
      '实习成员可提前学习对应方向，新成员后续统一确认。',
    ])
  })
})

describe('associationMeta', () => {
  it('提供协会招新与 QQ 群信息', () => {
    expect(associationMeta).toEqual({
      name: '沈阳理工大学计算机协会',
      recruitment: '2026 招新',
      qqGroup: '1081018272',
    })
  })
})
