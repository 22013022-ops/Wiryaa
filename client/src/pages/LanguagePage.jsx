import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const languages = [{ code: 'en', name: 'English' }, { code: 'mr', name: 'मराठी' }, { code: 'hi', name: 'हिन्दी' }]
function LanguagePage() {
  const { t, i18n } = useTranslation(); const [selected, setSelected] = useState(i18n.language); const location = useLocation(); const navigate = useNavigate()
  const continueToDestination = () => { localStorage.setItem('wiryaa-language', selected); i18n.changeLanguage(selected); navigate(location.state?.destination || '/', { replace: true }) }
  return <main className="language-page"><section className="language-card"><p>WIRYAA</p><h1>{t('languageTitle')}</h1><span>{t('languageText')}</span><div className="language-options">{languages.map((language) => <button key={language.code} className={selected === language.code ? 'selected' : ''} onClick={() => setSelected(language.code)} type="button">{language.name}</button>)}</div><button className="auth-submit" type="button" onClick={continueToDestination}>{t('continue')}</button></section></main>
}
export default LanguagePage
