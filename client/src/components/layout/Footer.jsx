import logo from '../../assets/icons/wiryaa-logo.png'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  const [subscribed, setSubscribed] = useState(false)
  return <footer id="contact" className="site-footer">
    <div className="footer-grid"><div><a className="footer-brand" href="/"><img src={logo} alt="" />Wiryaa</a><p>Careers, hiring and entrepreneurship—built to help women move forward.</p></div><div><h3>Quick Links</h3><a href="/">Home</a><a href="/#services">Services</a><Link to="/about">About</Link><a href="/#services">Marketplace</a></div><div><h3>Contact</h3><a href="mailto:hello@wiryaa.com">hello@wiryaa.com</a><a href="tel:+910000000000">+91 00000 00000</a><p>India · Built with purpose</p><div className="socials"><a href="#linkedin">in</a><a href="#github">gh</a><a href="#instagram">ig</a></div></div><div><h3>Stay in the loop</h3><p>Get opportunities and thoughtful updates.</p><form onSubmit={(e) => { e.preventDefault(); setSubscribed(true) }}><input type="email" required aria-label="Email address" placeholder="Email address" /><button type="submit">{subscribed ? 'Subscribed!' : 'Subscribe'}</button></form></div></div>
    <div className="footer-bottom"><span>© 2026 Wiryaa. All rights reserved.</span><span><a href="#privacy">Privacy</a><a href="#terms">Terms</a></span></div>
  </footer>
}
export default Footer
