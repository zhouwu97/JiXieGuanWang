import { recruitmentNotes, tracks } from '../data/tracks'
import { GlitchText, Reveal, SectionTag } from './common'

export function BriefingSection() {
  const restrictedCount = tracks.filter((track) => track.restricted).length
  const openCount = tracks.length - restrictedCount

  return (
    <section id="notice" className="section notice">
      <span className="ghost-word" aria-hidden="true">
        NOTICE
      </span>
      <div className="container">
        <div className="section-heading section-heading--split">
          <div>
            <SectionTag number="03" en="RECRUITMENT NOTICE" label="招新说明" />
            <h2 className="section-title">
              入场之前
              <br />
              <GlitchText text="请先读取" />
            </h2>
          </div>
          <p className="section-side">
            这不是一场短暂的围观。
            <br />
            请带着你的兴趣与时间前来。
          </p>
        </div>

        <div className="notice-grid">
          <Reveal className="notice-main">
            <div className="notice-alert">
              <span className="alert-mark" aria-hidden="true">
                !
              </span>
              <span>重要说明 / READ BEFORE JOINING</span>
            </div>
            <div className="notes-list">
              {recruitmentNotes.map((note, index) => (
                <div className="note-row" key={note}>
                  <span className="note-row__num">{String(index + 1).padStart(2, '0')}</span>
                  <p>{note}</p>
                  <i aria-hidden="true">▸</i>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="notice-side" delay={140}>
            <span className="dossier__label">RECRUIT SCOPE</span>
            <div className="scope-row">
              <strong>{restrictedCount}</strong>
              <span>
                条方向限专业
                <small>计算机 · 电子信息</small>
              </span>
            </div>
            <div className="scope-row">
              <strong>{openCount}</strong>
              <span>
                条方向全校开放
                <small>不设专业门槛</small>
              </span>
            </div>

            <span className="dossier__label dossier__label--gap">MEMBERSHIP STATUS</span>
            <div className="status-readout">
              <i className="live-dot" aria-hidden="true" />
              <strong>实习成员</strong>
              <span>可提前参与对应方向学习活动</span>
            </div>
            <div className="status-readout">
              <i className="dim-dot" aria-hidden="true" />
              <strong>正式成员</strong>
              <span>开学招新结束后统一确认方向</span>
            </div>

            <div className="seal" aria-hidden="true">
              <span>CS</span>
              <small>SYIT / 2026</small>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
