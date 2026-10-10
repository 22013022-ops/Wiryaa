import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiCheck, FiUser, FiX } from 'react-icons/fi'
import api from '../../services/api'
import CandidateProfileDetails from '../profiles/CandidateProfileDetails'
import JobPostDetails from '../jobs/JobPostDetails'
import '../../styles/Connections.css'

const tabs = ['received', 'sent', 'connected']
const statusKeys = { pending: 'pending', accepted: 'connected', rejected: 'declined', cancelled: 'cancelled' }

function Connections({ workspace }) {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = useState('received')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const language = i18n.resolvedLanguage || i18n.language
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await api.get('/notifications/connections', { params: { tab, language } })
      setEntries(response.data.data.entries || [])
    } catch (requestError) { setError(requestError.response?.data?.message || t('connections.loadFailed')) }
    finally { setLoading(false) }
  }, [tab, language, t])
  useEffect(() => { load() }, [load])
  const act = async (entry, action) => {
    setBusyId(entry._id); setError('')
    try {
      if (action === 'cancel') await api.delete(`/notifications/requests/${entry.requestId}`)
      else await api.patch(`/notifications/requests/${entry.requestId}/decision`, { decision: action })
      await load()
    } catch (requestError) { setError(requestError.response?.data?.message || t('connections.actionFailed')) }
    finally { setBusyId(null) }
  }
  const viewProfile = async (entry) => {
    setProfileLoading(true); setError('')
    try {
      if (workspace === 'hireTalents') {
        const response = await api.get(`/hire-talents/job-post/candidates/${entry.user?._id}/profile`, { params: { language } })
        setSelectedProfile({ kind: 'candidate', profile: response.data.data.profile })
      } else {
        const response = await api.get('/jobs/recommendations', { params: { language } })
        const jobId = String(entry.jobPost?._id || entry.jobPostId || '')
        const recommendation = (response.data.data.recommendations || []).find(({ job }) => String(job?._id) === jobId)
        if (!recommendation?.job) throw new Error(t('connections.profileUnavailable'))
        setSelectedProfile({ kind: 'job', post: recommendation.job })
      }
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || t('connections.profileUnavailable')) }
    finally { setProfileLoading(false) }
  }
  const statusLabel = (status) => t(`connections.status.${statusKeys[status] || statusKeys.pending}`)
  if (selectedProfile?.kind === 'candidate') return <CandidateProfileDetails profile={selectedProfile.profile} onBack={() => setSelectedProfile(null)} />
  if (selectedProfile?.kind === 'job') return <JobPostDetails post={selectedProfile.post} onBack={() => setSelectedProfile(null)} />
  return <section className={`connections-page ${workspace === 'hireTalents' ? 'connections-hiring' : ''}`}>
    <div className="connections-heading"><div><p>{t(workspace === 'hireTalents' ? 'hireTalents.workspace' : 'findJobs.workspace')}</p><h1>{t('connections.title')}</h1><span>{t('connections.intro')}</span></div></div>
    <div className="connections-tabs" role="tablist" aria-label={t('connections.title')}>{tabs.map((key) => <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{t(`connections.tabs.${key}`)}</button>)}</div>
    {error && <p className="connections-error" role="alert">{error}</p>}
    {profileLoading && <div className="connections-empty">{t('connections.loadingProfile')}</div>}
    {loading ? <div className="connections-empty">{t('connections.loading')}</div> : entries.length === 0 ? <div className="connections-empty"><span className="connections-empty-icon"><FiUser /></span><p>{t(`connections.empty.${tab}`)}</p></div> : <div className="connections-list">{entries.map((entry) => <article className="connection-card" key={entry._id}>
      <div className="connection-card-body"><div className="connection-card-title"><h2>{entry.user?.fullName || t('connections.unknownUser')}</h2><span className={`connection-status status-${entry.status || 'pending'}`}>{statusLabel(entry.status || 'pending')}</span></div>
        {entry.summary && <p className="connection-summary">{entry.summary}</p>}{entry.jobPost?.jobTitle && <small className="connection-context">{t('connections.aboutJob', { title: entry.jobPost.jobTitleEnglish || entry.jobPost.jobTitle })}</small>}
        <small className="connection-time">{new Date(entry.createdAt).toLocaleString(({ en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' })[language] || 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small>
      </div>
      <div className="connection-actions"><button type="button" onClick={() => viewProfile(entry)} disabled={profileLoading}>{t('connections.viewProfile')}</button>
        {tab === 'received' && entry.status === 'pending' && <><button type="button" disabled={busyId === entry._id} onClick={() => act(entry, 'accepted')}><FiCheck /> {t('connections.accept')}</button><button className="connection-reject" type="button" disabled={busyId === entry._id} onClick={() => act(entry, 'rejected')}><FiX /> {t('connections.reject')}</button></>}
        {tab === 'sent' && entry.status === 'pending' && <button className="connection-reject" type="button" disabled={busyId === entry._id} onClick={() => act(entry, 'cancel')}>{t('connections.cancel')}</button>}
      </div>
    </article>)}</div>}
  </section>
}

export default Connections
