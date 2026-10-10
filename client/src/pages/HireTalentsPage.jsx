import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiClipboard, FiHome, FiPlus, FiUsers } from 'react-icons/fi'
import '../styles/HireTalentsPage.css'
import logo from '../assets/icons/wiryaa-monogram.png'
import ProfileMenu from '../components/layout/ProfileMenu'
import api from '../services/api'
import JobPostDetails from '../components/jobs/JobPostDetails'
import CandidateProfileDetails from '../components/profiles/CandidateProfileDetails'

const navItems = [{ id: 'create', icon: FiPlus }, { id: 'posts', icon: FiClipboard }, { id: 'recommendations', icon: FiUsers }]
const fields = [['name', true], ['email'], ['phone', true], ['company', true], ['title', true], ['category', true], ['type', true], ['location', true], ['address'], ['description', true], ['experience'], ['salary'], ['benefits'], ['qualifications', true]]
const valueName = (key) => ({ company: 'companyName', title: 'jobTitle', type: 'jobType' }[key] || key)
function Form({ jobPost, loading, onSaved }) { const { t, i18n } = useTranslation(); const formRef = useRef(null); const categories = t('hireTalents.categories', { returnObjects: true }); const jobTypes = t('hireTalents.jobTypes', { returnObjects: true }); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState(''); const markUnsaved = (event) => event.target.closest('.ht-field')?.classList.add('is-dirty'); const submit = async (e) => { e.preventDefault(); if (!e.currentTarget.reportValidity()) return; setSaving(true); try { const r = await api.post('/hire-talents/job-post', Object.fromEntries(new FormData(e.currentTarget))); onSaved(r.data.data.jobPost); formRef.current?.querySelectorAll('.is-dirty').forEach((field) => field.classList.remove('is-dirty')); setSaved(true) } catch (x) { setError(x.response?.data?.message || t('hireTalents.saveFailed')) } finally { setSaving(false) } }; if (loading) return <section className="ht-job-status">{t('hireTalents.loading')}</section>; const update = Boolean(jobPost); const input = ([key, required], index) => <label className="ht-field" key={key}><span>{t(`hireTalents.${key}`)}{required && <em> *</em>}</span>{key === 'category' ? <><input name="category" list="job-categories" required defaultValue={jobPost?.category || ''} placeholder={t('hireTalents.placeholders.category')} /><datalist id="job-categories">{categories.map((value) => <option key={value} value={value} />)}</datalist></> : key === 'type' ? <><input name="jobType" list="job-types" required defaultValue={jobPost?.jobType || ''} placeholder={t('hireTalents.placeholders.type')} /><datalist id="job-types">{jobTypes.map((value) => <option key={value} value={value} />)}</datalist></> : index > 7 ? <textarea name={valueName(key)} required={required} defaultValue={jobPost?.[valueName(key)] || ''} placeholder={t(`hireTalents.placeholders.${key}`)} /> : <input name={valueName(key)} required={required} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} defaultValue={jobPost?.[valueName(key)] || ''} placeholder={t(`hireTalents.placeholders.${key}`)} />}</label>; return <form ref={formRef} className="ht-form" onSubmit={submit} onChange={markUnsaved}><input type="hidden" name="inputLanguage" value={i18n.language} /><div className="ht-page-title"><div><p>{t('hireTalents.workspace')}</p><h1>{t(update ? 'hireTalents.update' : 'hireTalents.create')}</h1><span>{t('hireTalents.intro')}</span></div></div><section className="ht-section"><div className="ht-section-heading"><div><h2>{t('hireTalents.contact')}</h2><p>{t('hireTalents.contactHelp')}</p></div></div><div className="ht-grid ht-grid-2">{fields.slice(0, 4).map(input)}</div></section><section className="ht-section"><div className="ht-section-heading"><div><h2>{t('hireTalents.details')}</h2><p>{t('hireTalents.detailsHelp')}</p></div></div><div className="ht-grid ht-grid-2">{fields.slice(4).map((f, i) => input(f, i + 4))}</div></section><div className="ht-submit-row"><span>{t('hireTalents.required')}</span><button className="ht-submit" disabled={saving}>{t(saving ? 'hireTalents.saving' : update ? 'hireTalents.save' : 'hireTalents.publish')}</button></div>{saved && <div className="ht-toast" role="status"><strong>{t('hireTalents.saved')}</strong><span>{t('hireTalents.savedText')}</span></div>}{error && <div className="ht-success ht-error" role="alert">{error}</div>}</form> }
function View() { const { t, i18n } = useTranslation(); const [post, setPost] = useState(null); const [error, setError] = useState(''); const language = i18n.resolvedLanguage || i18n.language; useEffect(() => { api.get('/hire-talents/job-post', { params: { language } }).then((r) => setPost(r.data.data.jobPost)).catch((e) => setError(e.response?.data?.message || t('hireTalents.loadFailed'))) }, [t, language]); if (error) return <section className="ht-job-status ht-error">{error}</section>; if (!post) return <section className="ht-job-status">{t('hireTalents.loading')}</section>; return <JobPostDetails post={post} /> }
function Candidates() {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [selectedProfile, setSelectedProfile] = useState(null); const [profileLoading, setProfileLoading] = useState(false)
  const openingId = useRef(globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
  const selectedProfileUserId = useRef(null); const inFlight = useRef(null); const language = i18n.resolvedLanguage || i18n.language
  const load = useCallback(async (viewId) => {
    const requestKey = viewId ? `${viewId}:${language}` : null
    if (requestKey && inFlight.current?.viewId === requestKey) return inFlight.current.promise
    setLoading(true); setError('')
    const request = api.get('/hire-talents/job-post/candidates', { params: { language, ...(viewId ? { recommendationViewId: viewId } : {}) } })
    const promise = request.then((response) => {
      const matches = response.data.data.candidates || []
      console.table(matches.map(({ user, finalScore, skillScore, constraintScore, locationScore, conflictPenalty }) => ({ candidate: user?.fullName, finalScore, skillScore, constraintScore, locationScore, conflictPenalty })))
      setItems(matches)
    }).catch((requestError) => { setError(requestError.response?.data?.message || t('hireTalents.loadFailed')) }).finally(() => {
      setLoading(false)
      if (inFlight.current?.promise === promise) inFlight.current = null
    })
    if (requestKey) inFlight.current = { viewId: requestKey, promise }
    return promise
  }, [t, language])
  useEffect(() => { load(openingId.current) }, [load])
  useEffect(() => {
    const userId = selectedProfileUserId.current
    if (!userId) return
    api.get(`/hire-talents/job-post/candidates/${userId}/profile`, { params: { language } })
      .then((response) => setSelectedProfile(response.data.data.profile))
      .catch((requestError) => setError(requestError.response?.data?.message || t('hireTalents.loadFailed')))
  }, [language, t])
  const openProfile = async (userId) => {
    selectedProfileUserId.current = userId
    setProfileLoading(true); setError('')
    try {
      const response = await api.get(`/hire-talents/job-post/candidates/${userId}/profile`, { params: { language } })
      setSelectedProfile(response.data.data.profile)
    } catch (requestError) { setError(requestError.response?.data?.message || t('hireTalents.loadFailed')) }
    finally { setProfileLoading(false) }
  }
  if (selectedProfile) return <CandidateProfileDetails profile={selectedProfile} onBack={() => { selectedProfileUserId.current = null; setSelectedProfile(null) }} />
  return <section className="ht-job-page"><div className="ht-page-title"><div><p>{t('hireTalents.workspace')}</p><h1>{t('hireTalents.recommendations')}</h1><span>{t('hireTalents.recommendationIntro')}</span></div><button className="ht-submit" type="button" onClick={() => load()} disabled={loading}>{loading ? t('hireTalents.loadingCandidates') : t('hireTalents.refreshCandidates')}</button></div>{loading && <section className="ht-job-status">{t('hireTalents.loadingCandidates')}</section>}{profileLoading && <section className="ht-job-status">{t('hireTalents.loadingCandidateProfile')}</section>}{error && <section className="ht-job-status ht-error" role="alert">{error}</section>}{!loading && !error && !items.length && <p>{t('hireTalents.noCandidates')}</p>}<div className="ht-recommendation-grid">{items.map(({ user, profile }) => <button className="ht-recommendation-card" key={user?._id} type="button" onClick={() => openProfile(user._id)}><h2>{profile?.name || user?.fullName || t('hireTalents.candidate')}</h2><p>{[profile?.skills, profile?.previousJobs, profile?.qualification].filter(Boolean).join(' · ') || t('hireTalents.candidatePreviewFallback')}</p><span>{t('hireTalents.viewCandidateProfile')} →</span></button>)}</div></section>
}
function HireTalentsPage() { const { t } = useTranslation(); const [page, setPage] = useState('create'); const [post, setPost] = useState(null); const [loading, setLoading] = useState(true); useEffect(() => { api.get('/hire-talents/job-post').then((r) => setPost(r.data.data.jobPost)).finally(() => setLoading(false)) }, []); const create = t(post ? 'hireTalents.update' : 'hireTalents.create'); return <div className="hire-talents-shell"><div className="ht-layout"><div className="ht-profile-corner"><ProfileMenu /></div><aside className="ht-sidebar"><a className="ht-brand" href="/"><img src={logo} alt="" /><span>Wiryaa</span></a><a className="ht-sidebar-home" href="/"><FiHome /> {t('common.backHome')}</a><p>{t('hireTalents.workspace')}</p>{navItems.map(({ id, icon: Icon }) => <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon /> {id === 'create' ? create : t(`hireTalents.${id}`)}</button>)}</aside><main className="ht-content">{page === 'create' ? <Form jobPost={post} loading={loading} onSaved={setPost} /> : page === 'posts' ? <View /> : <Candidates />}</main></div></div> }
export default HireTalentsPage
