import { getTrackById } from '../data/tracks'
import { GlitchText, Reveal, SectionTag } from './common'

const liveUrl = 'https://sylulive.online/'

const deployLines: readonly string[] = [
  '→ 04 条分路完成打包 · 01.84s',
  '→ build passed · 0.026s',
  '→ 2 个项目席位开放中 · 择优选拔',
]

const stackChips: readonly string[] = [
  'React 19',
  'TypeScript',
  'Vite 7',
  'Vitest',
  'Canvas 粒子',
  'CSS 动效',
]

export function ProjectSection() {
  const fullstack = getTrackById('ai-fullstack')

  return (
    <section id="field" className="section field">
      <span className="ghost-word" aria-hidden="true">
        FIELD
      </span>
      <div className="container">
        <div className="section-heading">
          <SectionTag number="03" en="FIELD PROJECT" label="项目现场" />
          <Reveal>
            <h2 className="section-title">
              把练习场
              <br />
              <GlitchText text="连接到现实" />
            </h2>
          </Reveal>
        </div>

        <div className="field-grid">
          <Reveal className="field-intro">
            <p className="field-kicker">FIELD PROJECT / CAMPUS LIVE</p>
            <p>
              真正的项目不会等待你准备好。我们用真实需求、真实协作与真实发布，
              给每个认真写代码的人一张通往现场的票。
            </p>
            <p className="field-stack-label">ENGINE STACK / 本站由协会成员构建</p>
            <div className="stack-chips">
              {stackChips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
            <div className="field-actions">
              <a className="btn btn--line" href={liveUrl} target="_blank" rel="noreferrer">
                前往校园 live <span aria-hidden="true">↗</span>
              </a>
              <a className="text-link" href="#join">
                查看入场方式 <span aria-hidden="true">▸</span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="field-board">
            <div className="deploy-terminal" aria-label="项目部署终端">
              <div className="deploy-terminal__bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>deploy: campus-live</span>
              </div>
              <div className="deploy-terminal__body">
                <p>
                  <b className="term-prompt">$</b> syit deploy --project=campus-live
                </p>
                <p>
                  → 部署目标：campus-live · 校园服务
                  <br />
                  → 线上站点：
                  <a className="term-link" href={liveUrl} target="_blank" rel="noreferrer">
                    sylulive.online ↗
                  </a>
                </p>
                {deployLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p>
                  <span className="term-ok">✓ READY</span>
                  <em className="term-caret-s" aria-hidden="true">
                    ▊
                  </em>
                </p>
              </div>
            </div>

            <div className="timeline" aria-label="项目机会时间表">
              {fullstack?.projectOpportunity?.map((item, index) => (
                <div className="timeline-step" key={item}>
                  <span className="timeline-node">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="timeline-label">
                      {index === 0 ? '第一学期末' : '第二学期'}
                    </span>
                    <strong>{item.replace(/^第一学期末|^第二学期/, '')}</strong>
                  </div>
                </div>
              ))}
              <div className="timeline-step timeline-step--future">
                <span className="timeline-node">∞</span>
                <div>
                  <span className="timeline-label">持续发生</span>
                  <strong>根据项目进展，后续开放更多席位</strong>
                </div>
              </div>
            </div>

            <div className="code-strip" aria-label="工程能力输出">
              <span className="code-strip__prompt">$</span>
              <span className="code-strip__cmd">syit ship --field=campus-live --member=01</span>
              <i className="code-strip__caret" aria-hidden="true" />
              <span className="code-strip__result">
                compiled in 0.026s · <b>OK</b>
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
