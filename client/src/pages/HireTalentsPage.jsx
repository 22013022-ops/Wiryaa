import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
function HireTalentsPage() { const { t } = useTranslation(); return <main className="placeholder-page"><section className="placeholder-card"><p>WIRYAA</p><h1>{t('hireTalents')}</h1><span>Post roles and connect with exceptional women candidates. This experience is coming soon.</span><Link className="auth-submit placeholder-link" to="/">Back to home</Link></section></main> }
export default HireTalentsPage
