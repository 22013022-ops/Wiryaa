import { Link } from 'react-router-dom'
import { getSessionUser } from '../services/authStorage'
import { useTranslation } from 'react-i18next'

function ProfilePage() {
  const { t } = useTranslation()
  const user = getSessionUser()
  return <main className="placeholder-page"><section className="placeholder-card profile-card"><p>{t('profile.heading')}</p><h1>{user?.fullName}</h1><span>{user?.email || user?.mobile}</span><dl><div><dt>{t('profile.gender')}</dt><dd>{user?.gender}</dd></div><div><dt>{t('profile.preferredLanguage')}</dt><dd>{localStorage.getItem('wiryaa-language') || 'en'}</dd></div></dl><Link className="auth-submit placeholder-link" to="/">{t('common.backHome')}</Link></section></main>
}

export default ProfilePage
