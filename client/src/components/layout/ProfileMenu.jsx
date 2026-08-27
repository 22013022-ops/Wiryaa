import { useState } from 'react'
import { FiChevronDown, FiGlobe, FiLogOut, FiUser } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getSessionUser } from '../../services/authStorage'
import '../../styles/ProfileMenu.css'

function ProfileMenu({ className = '' }) {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const user = getSessionUser()
  const contact = user?.email || user?.mobile || t('common.account')
  const initials = user?.fullName?.trim()?.charAt(0)?.toUpperCase() || <FiUser />

  const logout = () => {
    localStorage.removeItem('wiryaa-token')
    localStorage.removeItem('wiryaa-user')
    navigate('/', { replace: true })
  }
  const changeLanguage = (event) => {
    localStorage.setItem('wiryaa-language', event.target.value)
    i18n.changeLanguage(event.target.value)
  }

  return <div className={`profile-menu ${className}`}>
    <button className="profile-menu-trigger" type="button" onClick={() => setIsOpen((open) => !open)} aria-label={t('common.account')} aria-expanded={isOpen}><span className="profile-menu-avatar">{initials}</span><FiChevronDown /></button>
    <div className={`profile-menu-popover ${isOpen ? 'is-open' : ''}`}>
      <div className="profile-menu-details"><span className="profile-menu-avatar large">{initials}</span><div><strong>{user?.fullName || t('common.account')}</strong><small>{contact}</small>{user?.gender && <small>{user.gender}</small>}</div></div>
      <Link to="/profile" onClick={() => setIsOpen(false)}><FiUser /> {t('common.account')}</Link>
      <label><FiGlobe /> <span>{t('common.language')}</span><select value={i18n.language} onChange={changeLanguage} aria-label={t('common.language')}><option value="en">English</option><option value="hi">हिन्दी</option><option value="mr">मराठी</option></select></label>
      <button type="button" onClick={logout}><FiLogOut /> {t('common.logout')}</button>
    </div>
  </div>
}

export default ProfileMenu
