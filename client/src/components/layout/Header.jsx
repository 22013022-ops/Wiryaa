import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/icons/wiryaa-logo.png'

const links = [
  ['/', 'Home', false],
  ['/#services', 'Services', true],
  ['/about', 'About us', false],
  ['/#contact', 'Contact', true],
]

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('/')

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
          {links.map(([href, label, isAnchor]) => isAnchor ? <a key={href} className={active === href ? 'active' : ''} href={href}>{label}</a> : <Link key={href} className={active === href ? 'active' : ''} to={href}>{label}</Link>)}
          <Link className="signup-link" to="/signup">Sign up</Link>
        </div>
      </nav>
    </header>
  )
}

export default Header
