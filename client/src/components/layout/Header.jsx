import logo from '../../assets/icons/wiryaa-logo.png'

function Header() {
  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Primary navigation">
        <a className="brand" href="#home" aria-label="Wiryaa home">
          <img src={logo} alt="" />
          <span>Wiryaa</span>
        </a>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About us</a>
          <a href="#contact">Contact</a>
          <a className="signup-link" href="#signup">Sign up</a>
        </div>
      </nav>
    </header>
  )
}

export default Header
