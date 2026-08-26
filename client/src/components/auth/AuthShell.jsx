import { Link } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiShield } from 'react-icons/fi'
import logo from '../../assets/icons/wiryaa-logo.png'

function AuthShell({ children, mode }) {
  const isSignup = mode === 'signup'

  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <Link className="auth-back" to="/" aria-label="Back to Wiryaa home"><FiArrowLeft /> <span>Back to home</span></Link>
      <section className="auth-container">
        <aside className="auth-intro">
          <Link className="auth-brand" to="/" aria-label="Wiryaa home"><img src={logo} alt="" /><span>Wiryaa</span></Link>
          <div className="auth-intro-copy">
            <p className="auth-kicker">A PLACE TO GROW</p>
            <h1>{isSignup ? 'Your next chapter starts here.' : 'Welcome back to your journey.'}</h1>
            <p>{isSignup ? 'Join a community built to help women discover meaningful opportunities and move forward with confidence.' : 'Pick up where you left off and keep building the career or team you believe in.'}</p>
          </div>
          <div className="auth-benefits">
            <span><FiCheckCircle /> Discover opportunities made for you</span>
            <span><FiShield /> Your information stays protected</span>
          </div>
        </aside>
        <section className="auth-card" aria-labelledby="auth-title">{children}</section>
      </section>
    </main>
  )
}

export default AuthShell
