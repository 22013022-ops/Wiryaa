import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getSessionUser } from '../services/authStorage'

function FindJobsPage() {
  const { t } = useTranslation(); const user = getSessionUser()
  if (user?.gender === 'Male') return <main className="placeholder-page"><section className="placeholder-card"><p>WIRYAA FOR WOMEN</p><h1>This service is dedicated to women.</h1><span>We appreciate your interest. While Find Jobs supports women candidates, you can help create opportunities through Hire Talents.</span><Link className="auth-submit placeholder-link" to="/hire-talents">{t('hireTalents')}</Link></section></main>
  return <main className="placeholder-page"><section className="placeholder-card"><p>WIRYAA</p><h1>{t('findJobs')}</h1><span>Your personalised job discovery experience is coming soon.</span><Link className="auth-submit placeholder-link" to="/">Back to home</Link></section></main>
}
export default FindJobsPage
