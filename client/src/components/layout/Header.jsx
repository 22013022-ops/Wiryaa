import { useEffect, useState } from 'react'
import logo from '../../assets/icons/wiryaa-logo.png'

const links = [['home', 'Home'], ['services', 'Services'], ['about', 'About us'], ['contact', 'Contact']]

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
      const current = [...links].reverse().find(([id]) => document.getElementById(id)?.getBoundingClientRect().top <= 180)
      if (current) setActive(current[0])
    }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="navbar" aria-label="Primary navigation">
        <a className="brand" href="#home" aria-label="Wiryaa home">
          <img src={logo} alt="" />
          <span>Wiryaa</span>
        </a>
        <div className="nav-links">
          {links.map(([id, label]) => <a key={id} className={active === id ? 'active' : ''} href={`#${id}`}>{label}</a>)}
          <a className="signup-link" href="#signup">Sign up</a>
        </div>
      </nav>
    </header>
  )
}

export default Header
