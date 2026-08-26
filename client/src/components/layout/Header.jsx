import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/icons/wiryaa-monogram.png'
import { useTranslation } from 'react-i18next'
import { FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi'
import { getSessionUser } from '../../services/authStorage'

const links = [
  ['/', 'common.home', false],
  ['/#services', 'common.services', true],
  ['/about', 'common.about', false],
  ['/#contact', 'common.contact', true],
]

function Header() {
  const { t, i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('/')
  const [accountOpen, setAccountOpen] = useState(false)
  const navigate = useNavigate()
  const user = getSessionUser()

  const logout = () => {
    localStorage.removeItem('wiryaa-token')
    localStorage.removeItem('wiryaa-user')
    navigate('/', { replace: true })
  }
  const changeLanguage = ({ target }) => {
    localStorage.setItem('wiryaa-language', target.value)
    i18n.changeLanguage(target.value)
  }

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
      const current = [...links].reverse().find(([href, , isAnchor]) => isAnchor ? document.getElementById(href.replace('#', ''))?.getBoundingClientRect().top <= 180 : false)
      if (current) setActive(current[0])
    }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="navbar" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="Wiryaa home">
          <img src={logo} alt="" />
          <span>Wiryaa</span>
        </a>
        <div className="nav-links">
          {links.map(([href, label, isAnchor]) => isAnchor ? <a key={href} className={active === href ? 'active' : ''} href={href}>{t(label)}</a> : <Link key={href} className={active === href ? 'active' : ''} to={href}>{t(label)}</Link>)}
          {user ? <div className="account-menu">
            <button className="account-trigger" type="button" onClick={() => setAccountOpen((current) => !current)} aria-label="Open account menu" aria-expanded={accountOpen}><FiUser /><FiChevronDown /></button>
            <div className={`account-popover ${accountOpen ? 'is-open' : ''}`}>
              <div className="account-details"><strong>{user.fullName}</strong><span>{user.email || user.mobile}</span></div>
              <Link to="/profile" onClick={() => setAccountOpen(false)}><FiUser /> My account</Link>
              <label className="account-language"><span>Language</span><select value={i18n.language} onChange={changeLanguage} aria-label="Select language"><option value="en">English</option><option value="mr">मराठी</option><option value="hi">हिन्दी</option></select></label>
              <button type="button" onClick={logout}><FiLogOut /> Log out</button>
            </div>
          </div> : <Link className="signup-link" to="/signup" state={{ destination: '/' }}>{t('signUp')}</Link>}
        </div>
      </nav>
    </header>
  )
}

export default Header
