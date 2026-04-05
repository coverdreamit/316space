import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { navItems } from '../nav'
import LoginModal from './LoginModal'
import ProfileModal from './ProfileModal'
import ProfileReauthModal from './ProfileReauthModal'
import SignupModal from './SignupModal'

type ModalState = 'none' | 'login' | 'signup' | 'profile-reauth' | 'profile'

const ADMIN_ROLE = 'ADMIN'

export default function SiteLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, loginId, logout, role } = useAuth()
  const contentRef = useRef<HTMLDivElement>(null)
  const [modal, setModal] = useState<ModalState>('none')
  const [profileAccessToken, setProfileAccessToken] = useState<string | null>(null)

  const closeProfileFlow = () => {
    setProfileAccessToken(null)
    setModal('none')
  }

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
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
        {isAuthenticated ? (
          <div className="header-account">
            <button
              type="button"
              className="header-account-email"
              title={loginId ?? undefined}
              onClick={() =>
                role === ADMIN_ROLE ? navigate('/admin') : setModal('profile-reauth')
              }
            >
              {loginId}
            </button>
            <button
              type="button"
              className="header-admin-link"
              onClick={() => logout()}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="header-admin-link"
            onClick={() => setModal('login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Login
          </button>
        )}
      </header>

      {modal === 'login' && (
        <LoginModal
          onClose={() => setModal('none')}
          onSwitchToSignup={() => setModal('signup')}
        />
      )}
      {modal === 'signup' && (
        <SignupModal
          onClose={() => setModal('none')}
          onSwitchToLogin={() => setModal('login')}
        />
      )}
      {modal === 'profile-reauth' && (
        <ProfileReauthModal
          onClose={() => setModal('none')}
          onVerified={token => {
            setProfileAccessToken(token)
            setModal('profile')
          }}
        />
      )}
      {modal === 'profile' && profileAccessToken && (
        <ProfileModal profileAccessToken={profileAccessToken} onClose={closeProfileFlow} />
      )}

      <div className="page-content" ref={contentRef}>
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
    </div>
  )
}
