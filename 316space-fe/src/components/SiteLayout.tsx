import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { navItems } from '../nav'
import AccountModal from './AccountModal'
import LoginModal from './LoginModal'
import ProfileModal from './ProfileModal'
import ProfileReauthModal from './ProfileReauthModal'
import SignupModal from './SignupModal'

type ModalState = 'none' | 'login' | 'signup' | 'account' | 'profile-reauth' | 'profile'

const ADMIN_ROLE = 'ADMIN'

export default function SiteLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, loginId, logout, role } = useAuth()
  const contentRef = useRef<HTMLDivElement>(null)
  const resumeAccountAfterProfileRef = useRef(false)
  const [modal, setModal] = useState<ModalState>('none')
  const [profileAccessToken, setProfileAccessToken] = useState<string | null>(null)

  const handleProfileModalClose = () => {
    setProfileAccessToken(null)
    if (resumeAccountAfterProfileRef.current) {
      resumeAccountAfterProfileRef.current = false
      setModal('account')
    } else {
      setModal('none')
    }
  }

  const handleProfileReauthClose = () => {
    if (resumeAccountAfterProfileRef.current) {
      resumeAccountAfterProfileRef.current = false
      setModal('account')
    } else {
      setModal('none')
    }
  }

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="page">
      <header className="site-header">
        <Link to="/home" className="brand-link" aria-label="316 spacebox 홈">
          <span className="brand-logo" aria-hidden>
            <span className="brand-logo__316">316</span>
            <span className="brand-logo__word">spacebox</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <ul className="site-nav-list">
            {navItems.map(({ to, label }) => (
              <li key={`${to}-${label}`}>
                <NavLink
                  to={to}
                  end
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
              aria-label="내 정보"
              onClick={() => (role === ADMIN_ROLE ? navigate('/admin') : setModal('account'))}
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
            LOGIN
          </button>
        )}
      </header>

      {modal === 'login' && (
        <LoginModal
          onClose={() => setModal('none')}
          onSwitchToSignup={() => setModal('signup')}
          onForgotPassword={() => {
            setModal('none')
            navigate('/contact')
          }}
        />
      )}
      {modal === 'signup' && (
        <SignupModal
          onClose={() => setModal('none')}
          onSwitchToLogin={() => setModal('login')}
        />
      )}
      {modal === 'account' && (
        <AccountModal
          onClose={() => setModal('none')}
          onRequestProfileEdit={() => {
            resumeAccountAfterProfileRef.current = true
            setModal('profile-reauth')
          }}
        />
      )}
      {modal === 'profile-reauth' && (
        <ProfileReauthModal
          onClose={handleProfileReauthClose}
          onVerified={token => {
            setProfileAccessToken(token)
            setModal('profile')
          }}
        />
      )}
      {modal === 'profile' && profileAccessToken && (
        <ProfileModal profileAccessToken={profileAccessToken} onClose={handleProfileModalClose} />
      )}

      <div className="page-content" ref={contentRef}>
        <Outlet />

        {pathname !== '/' && (
          <footer className="site-footer">
            <nav className="footer-nav" aria-label="약관 및 지원">
              <a href="#terms">Terms &amp; Support</a>
              <span className="sep" aria-hidden>
                ·
              </span>
              <a href="#privacy">Privacy Policy</a>
            </nav>
          </footer>
        )}
      </div>
    </div>
  )
}
