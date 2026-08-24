const navItems = [
  { id: 'home', label: '首页', en: 'INDEX' },
  { id: 'paths', label: '技术方向', en: 'PATHS' },
  { id: 'route', label: '培养路线', en: 'ROUTE' },
  { id: 'field', label: '项目现场', en: 'FIELD' },
  { id: 'activities', label: '社团活动', en: 'LOG' },
  { id: 'notice', label: '招新说明', en: 'NOTICE' },
  { id: 'join', label: '加入协会', en: 'JOIN' },
] as const

const assetBase = import.meta.env.BASE_URL

export function Header({ activeSection }: { activeSection: string }) {
  return (
    <header className="site-header">
      <span
        className="scroll-progress"
        aria-hidden="true"
      />
      <a className="brand" href="#home" aria-label="返回首页">
        <img
          className="brand__logo"
          src={`${assetBase}assets/association-logo.jpg`}
          alt="沈阳理工大学计算机协会标志"
        />
        <span className="brand__text">
          <strong>SYIT · 计算机协会</strong>
          <small>COMPUTER ASSOCIATION</small>
        </span>
      </a>
      <nav className="main-nav" aria-label="主导航">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={activeSection === item.id ? 'is-active' : ''}
          >
            <span className="main-nav__num">{String(navItems.indexOf(item) + 1).padStart(2, '0')}</span>
            {item.label}
            <span className="main-nav__en">{item.en}</span>
          </a>
        ))}
      </nav>
      <a className="header-join" href="#join">
        JOIN&nbsp;US <span aria-hidden="true">▸</span>
      </a>
    </header>
  )
}
