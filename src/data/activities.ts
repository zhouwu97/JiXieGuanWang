export interface Activity {
  id: string
  date: string
  title: string
  english: string
  desc: string
  image: string
}

export const activities: readonly Activity[] = [
  {
    id: 'meetup',
    date: '2026·06·11',
    title: '轻云之上 · OpenClaw 云上部署公益行',
    english: 'LIGHTHOUSE MEETUP',
    desc: '腾讯轻量云 OpenClaw 云上部署公益活动落地沈阳理工大学站，现场大合影。',
    image: 'assets/activity-1.jpg',
  },
  {
    id: 'tutorial',
    date: '2026·06·11',
    title: 'OpenClaw 快速上手指南',
    english: 'HANDS-ON TUTORIAL',
    desc: '讲师现场演示 OpenClaw 部署流程，体验专属轻量服务器从 0 到 1。',
    image: 'assets/activity-2.jpg',
  },
  {
    id: 'talk',
    date: '2026·06·11',
    title: '嘉宾分享 · 从测开到 SRE',
    english: 'GUEST TALK',
    desc: '嘉宾「Ich bin More」在屏幕前带来了云、AI 与职业路径的现场分享。',
    image: 'assets/activity-3.jpg',
  },
  {
    id: 'build',
    date: '2026·06·11',
    title: '装机实操 · MeetUP mini',
    english: 'BUILD FOR REAL',
    desc: 'OpenClaw 装机活动：在真机上动手，让一次部署成为真正的现场课。',
    image: 'assets/activity-4.jpg',
  },
]
