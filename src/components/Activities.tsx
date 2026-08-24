import { activities } from '../data/activities'
import { GlitchText, Reveal, SectionTag } from './common'

const assetBase = import.meta.env.BASE_URL

export function ActivitiesSection() {
  return (
    <section id="activities" className="section archive">
      <span className="ghost-word" aria-hidden="true">
        LOG
      </span>
      <div className="container">
        <div className="section-heading section-heading--split">
          <div>
            <SectionTag number="04" en="CAMPUS RECORDS" label="社团活动" />
            <h2 className="section-title">
              技术不止在屏幕里
              <br />
              <GlitchText text="还能办成现场" />
            </h2>
          </div>
          <p className="section-side">
            线下分享、现场实操、大合影。
            <br />
            每一次活动，都是真实发生的证据。
          </p>
        </div>

        <div className="archive-grid">
          {activities.map((item, index) => (
            <Reveal key={item.id} delay={(index % 2) * 120}>
              <figure className="archive-card">
                <div className="archive-card__media">
                  <img src={`${assetBase}${item.image}`} alt={item.title} loading="lazy" />
                  <span className="archive-card__stamp" aria-hidden="true">
                    {item.english}
                  </span>
                </div>
                <figcaption>
                  <span className="archive-card__date" aria-hidden="true">
                    ◆ {item.date}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
