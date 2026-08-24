import { GlitchText, Reveal, SectionTag } from './common'

interface RouteStage {
  stage: string
  title: string
  english: string
  desc: string
}

const routeStages: readonly RouteStage[] = [
  {
    stage: '01',
    title: '基础补课',
    english: 'FOUNDATIONS',
    desc: '先教最基础的部分：语言语法、编程思维、开发环境。把地基打稳，后面的路才走得快。',
  },
  {
    stage: '02',
    title: 'AI 协作',
    english: 'AI PARTNERSHIP',
    desc: '学会用 AI 成为你的结对搭档：会提问、会校验、会改进，把 AI 当工具而不是拐杖。',
  },
  {
    stage: '03',
    title: '项目实战',
    english: 'SHIP IT',
    desc: '从简单项目开始，做到完整的小作品。难度由易到难，每一个项目都是一次真实成长。',
  },
  {
    stage: '04',
    title: '赛事检验',
    english: 'PROVE IT',
    desc: '拿比赛去检验成果，以战代练。项目做出来了，就去竞赛场里换一个真正的成绩。',
  },
]

export function RouteSection() {
  return (
    <section id="route" className="section route">
      <span className="ghost-word" aria-hidden="true">
        ROUTE
      </span>
      <div className="container">
        <div className="section-heading section-heading--split">
          <div>
            <SectionTag number="02" en="GROWTH ROUTE" label="培养路线" />
            <h2 className="section-title">
              项目做着做着
              <br />
              <GlitchText text="就会了" />
            </h2>
          </div>
          <p className="section-side">
            我们的培养路径很直接。
            <br />
            不是听完所有课才开始，而是玩着玩着就入门了。
          </p>
        </div>

        <div className="route-grid">
          {routeStages.map((item, index) => (
            <Reveal key={item.stage} delay={index * 110}>
              <article className="route-step">
                <span className="route-node">
                  <b>{item.stage}</b>
                </span>
                <h3>{item.title}</h3>
                <p className="route-en">{item.english}</p>
                <div className="route-line" aria-hidden="true" />
                <p className="route-desc">{item.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="route-quote">
            <span className="route-quote__mark" aria-hidden="true">
              「
            </span>
            <p>
              项目做着做着就会了。
              <small>—— 这是我们自己的学习方法，也是你的。</small>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
