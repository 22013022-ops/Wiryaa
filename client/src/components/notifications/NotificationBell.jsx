import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiBell, FiCheck, FiX } from 'react-icons/fi'
import api from '../../services/api'
import '../../styles/NotificationBell.css'

function NotificationBell() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const refresh = useCallback(async (markOpened = false) => {
    try {
      const { data } = await api.get('/notifications')
      const list = data.data.notifications || []
      setItems(list); setUnread(data.data.unreadCount || 0)
      if (markOpened) {
        const unreadItems = list.filter((item) => !item.isRead)
        if (unreadItems.length) {
          await Promise.all(unreadItems.map((item) => api.patch(`/notifications/${item._id}/read`)))
          setItems((current) => current.map((item) => ({ ...item, isRead: true })))
          setUnread(0)
        }
      }
      setError('')
    } catch (requestError) { setError(requestError.response?.data?.message || t('notifications.loadFailed')) }
  }, [t])
  useEffect(() => { refresh(); const timer = window.setInterval(() => refresh(), 30000); return () => window.clearInterval(timer) }, [refresh])
  const toggle = () => { const next = !open; setOpen(next); if (next) refresh(true) }
  const decide = async (item, decision) => {
    if (!item.request?._id) return
    setBusy(item._id); setError('')
    try { await api.patch(`/notifications/requests/${item.request._id}/decision`, { decision }); await refresh(true) }
    catch (requestError) { setError(requestError.response?.data?.message || t('notifications.actionFailed')) }
    finally { setBusy(null) }
  }
  const dateLocale = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' }[i18n.resolvedLanguage || i18n.language] || 'en-IN'
  const getMessage = (item) => {
    const title = item.request?.jobPost?.jobTitleEnglish || item.request?.jobPost?.jobTitle || ''
    if (item.type === 'contact_request') return t('notifications.contactRequest', { title })
    if (item.type === 'connect_invite') return t('notifications.connectInvite', { title })
    if (item.type === 'request_cancelled') return t('notifications.cancelled', { title })
    if (item.type === 'connection_created') return t('notifications.connectedNotice', { title })
    return t(item.type === 'request_accepted' ? 'notifications.accepted' : 'notifications.rejected', { title })
  }
  return <div className="notification-bell">
    <button className="notification-bell-trigger" type="button" onClick={toggle} aria-label={t('notifications.title')} aria-expanded={open}>
      <FiBell />{unread > 0 && <span className="notification-badge">{unread > 99 ? '99+' : unread}</span>}
    </button>
    {open && <><button className="notification-dismiss" type="button" aria-label={t('notifications.close')} onClick={() => setOpen(false)} /><section className="notification-panel" aria-label={t('notifications.title')}>
      <header><div><strong>{t('notifications.title')}</strong><small>{t('notifications.unread', { count: unread })}</small></div><button type="button" onClick={() => setOpen(false)} aria-label={t('notifications.close')}><FiX /></button></header>
      {error && <p className="notification-error" role="alert">{error}</p>}
      {!items.length ? <p className="notification-empty">{t('notifications.empty')}</p> : <ul>{items.map((item) => {
        const incoming = ['contact_request', 'connect_invite'].includes(item.type)
        const pending = incoming && item.request?.status === 'pending'
        return <li className={`notification-item${item.isRead ? '' : ' is-unread'}`} key={item._id}>
          <div className="notification-item-top"><strong>{item.sender?.fullName || t('notifications.someone')}</strong><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString(dateLocale, { dateStyle: 'medium', timeStyle: 'short' })}</time></div>
          <p>{getMessage(item)}</p><small>{item.isRead ? t('notifications.read') : t('notifications.unreadStatus')} · {item.request?.status === 'accepted' ? t('notifications.acceptedStatus') : item.request?.status === 'rejected' ? t('notifications.rejectedStatus') : item.request?.status === 'cancelled' ? t('connections.status.cancelled') : t('notifications.pendingStatus')}</small>
          {pending && <div className="notification-actions"><button disabled={busy === item._id} type="button" onClick={() => decide(item, 'accepted')}><FiCheck /> {t('notifications.accept')}</button><button disabled={busy === item._id} type="button" onClick={() => decide(item, 'rejected')}><FiX /> {t('notifications.reject')}</button></div>}
        </li>
      })}</ul>}
    </section></>}
  </div>
}

export default NotificationBell
