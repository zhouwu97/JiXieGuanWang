import { associationMeta } from '../data/tracks'
import { GlitchText, Reveal, SectionTag } from './common'

const assetBase = import.meta.env.BASE_URL

export function JoinSection() {
  const { recruitment, qqGroup } = associationMeta

  return (
    <section id="join" className="section join">
      <span className="ghost-word ghost-word--join" aria-hidden="true">
        JOIN
      </span>
      <div className="container join-inner">
        <Reveal className="join-copy">
          <SectionTag number="06" en="JOIN THE SOCIETY" label="加入协会" />
          <Reveal>
            <h2 className="section-title">
              准备好写下
              <br />
              <GlitchText text="下一行了吗？" />
            </h2>
          </Reveal>
          <p>
            扫描二维码加入 {recruitment}群，我们在群里等你发出第一条消息。
          </p>
          <div className="join-meta">
            <span>QQ GROUP // 招新群</span>
            <strong>{qqGroup}</strong>
          </div>
          <a className="btn btn--ink" href="#join">
            SCAN TO CONNECT <span aria-hidden="true">▸</span>
          </a>
        </Reveal>

        <Reveal className="qr-frame-wrap" delay={140}>
          <div className="qr-frame">
            <span className="qr-frame__label">ENTRY TICKET / 加入凭证</span>
            <img src={`${assetBase}assets/qq-group.jpg`} alt="计算机协会招新群二维码" />
            <span className="qr-frame__caption">SCAN TO CONNECT · 2026</span>
          </div>
        </Reveal>
      </div>

      <footer className="footer container">
        <span>SYIT · COMPUTER ASSOCIATION</span>
        <span>沈阳理工大学 · 2026</span>
        <span>POWERED BY REACT + VITE</span>
        <span>END OF TRANSMISSION_</span>
      </footer>
    </section>
  )
}
