import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { navItems } from '../nav'

export default function SiteLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="page">
      <header className="site-header">
        <Link to="/" className="brand-ko brand-link">
          316스페이스
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <ul className="site-nav-list">
            {navItems.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    isActive ? 'site-nav-link site-nav-link--active' : 'site-nav-link'
                  }
                >
                  <span className="site-nav-label">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <Outlet />

      <footer className="site-footer">
        <nav className="footer-nav" aria-label="약관 및 지원">
          <a href="#terms">Terms &amp; Support</a>
          <span className="sep" aria-hidden>
            ·
          </span>
          <a href="#privacy">Privacy Policy</a>
        </nav>
      </footer>
    </div>
  )
}
