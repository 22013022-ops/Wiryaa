import { Link } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiShield } from 'react-icons/fi'
import logo from '../../assets/icons/wiryaa-monogram.png'
import { useTranslation } from 'react-i18next'

function AuthShell({ children, mode }) {
  const isSignup = mode === 'signup'
  const { t } = useTranslation()

  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <Link className="auth-back" to="/" aria-label={t('auth.homeLabel')}><FiArrowLeft /> <span>{t('auth.backHome')}</span></Link>
      <section className="auth-container">
        <aside className="auth-intro">
          <Link className="auth-brand" to="/" aria-label={t('auth.homeLabel')}><img src={logo} alt="" /><span>Wiryaa</span></Link>
          <div className="auth-intro-copy">
            <p className="auth-kicker">{t('auth.grow')}</p>
            <h1>{t(isSignup ? 'auth.signupIntro' : 'auth.loginIntro')}</h1>
            <p>{t(isSignup ? 'auth.signupText' : 'auth.loginText')}</p>
          </div>
          <div className="auth-benefits">
            <span><FiCheckCircle /> {t('auth.opportunities')}</span>
            <span><FiShield /> {t('auth.protected')}</span>
          </div>
        </aside>
        <section className="auth-card" aria-labelledby="auth-title">{children}</section>
      </section>
    </main>
  )
}

export default AuthShell
