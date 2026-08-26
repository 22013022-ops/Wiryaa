import logo from '../../assets/icons/wiryaa-monogram.png'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Footer() {
  const { t } = useTranslation()
  const [subscribed, setSubscribed] = useState(false)
  return <footer id="contact" className="site-footer">
    <div className="footer-grid"><div><a className="footer-brand" href="/"><img src={logo} alt="" />Wiryaa</a><p>{t('footer.description')}</p></div><div><h3>{t('footer.quick')}</h3><a href="/">{t('common.home')}</a><a href="/#services">{t('common.services')}</a><Link to="/about">{t('common.about')}</Link><a href="/#services">{t('footer.marketplace')}</a></div><div><h3>{t('common.contact')}</h3><a href="mailto:hello@wiryaa.com">hello@wiryaa.com</a><a href="tel:+910000000000">+91 00000 00000</a><p>{t('footer.built')}</p><div className="socials"><a href="#linkedin">in</a><a href="#github">gh</a><a href="#instagram">ig</a></div></div><div><h3>{t('footer.loop')}</h3><p>{t('footer.updates')}</p><form onSubmit={(e) => { e.preventDefault(); setSubscribed(true) }}><input type="email" required aria-label={t('common.email')} placeholder={t('common.email')} /><button type="submit">{subscribed ? t('footer.subscribed') : t('footer.subscribe')}</button></form></div></div>
    <div className="footer-bottom"><span>{t('footer.rights')}</span><span><a href="#privacy">{t('footer.privacy')}</a><a href="#terms">{t('footer.terms')}</a></span></div>
  </footer>
}
export default Footer
