export interface EventPhoto {
  id: string
  title: string
  desc: string
  image: string
}

export const activityEvent = {
  name: '腾讯轻量云 OpenClaw 云上部署公益活动',
  english: 'LIGHTHOUSE MEETUP',
  date: '2026·06·11',
  venue: '沈阳理工大学 · 校内',
} as const

export const eventPhotos: readonly EventPhoto[] = [
  {
    id: 'tutorial',
    title: 'OpenClaw 快速上手指南',
    desc: '大屏演示 OpenClaw 部署流程，从 0 到 1 体验专属轻量服务器。',
    image: 'assets/activity-2.jpg',
  },
  {
    id: 'talk',
    title: '嘉宾分享 · 从测开到 SRE',
    desc: '「Ich bin More」现场分享云、AI 与职业路径：业余 SRE / 野路子测开。',
    image: 'assets/activity-3.jpg',
  },
  {
    id: 'build',
    title: '装机实操 · MeetUP mini',
    desc: 'OpenClaw 装机活动：真机动手，一次部署成为真正的现场课。',
    image: 'assets/activity-4.jpg',
  },
  {
    id: 'group',
    title: '轻云之上 · 圆满收官',
    desc: '沈阳理工大学站大合影，期待下一场与你面对面。',
    image: 'assets/activity-1.jpg',
  },
]
