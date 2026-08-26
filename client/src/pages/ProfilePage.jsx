import { Link } from 'react-router-dom'
import { getSessionUser } from '../services/authStorage'

function ProfilePage() {
  const user = getSessionUser()
  return <main className="placeholder-page"><section className="placeholder-card profile-card"><p>YOUR ACCOUNT</p><h1>{user?.fullName}</h1><span>{user?.email || user?.mobile}</span><dl><div><dt>Gender</dt><dd>{user?.gender}</dd></div><div><dt>Preferred language</dt><dd>{localStorage.getItem('wiryaa-language') || 'en'}</dd></div></dl><Link className="auth-submit placeholder-link" to="/">Back to home</Link></section></main>
}

export default ProfilePage
