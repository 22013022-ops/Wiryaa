import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { FiBriefcase, FiCheckCircle, FiFileText, FiHome, FiImage, FiLink, FiPlus, FiUser, FiUsers } from 'react-icons/fi'
import '../styles/FindJobsPage.css'
import logo from '../assets/icons/wiryaa-monogram.png'
import ProfileMenu from '../components/layout/ProfileMenu'
import VoiceInputButton from '../components/forms/VoiceInputButton'
import api from '../services/api'
import JobPostDetails from '../components/jobs/JobPostDetails'
import CandidateProfileDetails from '../components/profiles/CandidateProfileDetails'
import Connections from '../components/connections/Connections'

const fields = [{ name: 'name', type: 'text', required: true }, { name: 'email', type: 'email' }, { name: 'phone', type: 'tel', required: true }, { name: 'age', type: 'number', required: true, min: 16, max: 100 }, { name: 'state' }, { name: 'city' }, { name: 'pincode', pattern: '[0-9]{6}' }]
const navItems = [{ id: 'create', icon: FiPlus }, { id: 'profile', icon: FiUser }, { id: 'recommendations', icon: FiBriefcase }, { id: 'connections', icon: FiUsers }]

function FileDrop({ name, label, hint, accept, icon: Icon, multiple = false, onDirty }) {
  const [fileName, setFileName] = useState('')
  const [previews, setPreviews] = useState([])
  const inputRef = useRef(null)
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews])
  const setFiles = (files) => { setPreviews(files.map((file) => ({ file, url: URL.createObjectURL(file) }))); setFileName(files.length > 1 ? `${files.length} files selected` : files[0]?.name || '') }
  const selectFiles = (event) => { setFiles(Array.from(event.target.files || [])); onDirty?.(event) }
  const removeFile = (url) => { const remaining = previews.filter((preview) => preview.url !== url); const transfer = new DataTransfer(); remaining.forEach((preview) => transfer.items.add(preview.file)); if (inputRef.current) inputRef.current.files = transfer.files; setFiles(remaining.map((preview) => preview.file)); onDirty?.({ target: inputRef.current }) }
  return <><label className="fj-file-drop"><input ref={inputRef} name={name} type="file" accept={accept} multiple={multiple} onChange={selectFiles} /><span className="fj-file-icon"><Icon /></span><span><strong>{fileName || label}</strong><small>{fileName || hint}</small></span></label><MediaPreview previews={previews} onRemove={removeFile} /></>
}

function MediaPreview({ previews, onRemove }) {
  if (!previews.length) return null
  return <div className="fj-media-preview" aria-label="Selected file previews">{previews.map(({ file, url }) => <div className={`fj-media-preview-item${file.type.startsWith('image/') || file.type.startsWith('video/') ? '' : ' fj-document-preview'}`} key={url}>{file.type.startsWith('image/') ? <img src={url} alt={file.name} /> : file.type.startsWith('video/') ? <video controls preload="metadata"><source src={url} /></video> : <FiFileText />}<button type="button" className="fj-remove-media" onClick={() => onRemove?.(url)} aria-label={`Remove ${file.name}`}>×</button><span>{file.name}</span></div>)}</div>
}

function ComingSoon({ page }) {
  const { t } = useTranslation(); const Icon = page === 'profile' ? FiUser : FiBriefcase
  return <section className="fj-coming-soon"><span className="fj-coming-icon"><Icon /></span><p>{t('findJobs.workspace')}</p><h1>{t(`findJobs.${page}`)}</h1><span>{t('findJobs.comingSoon')}</span></section>
}

function Recommendations() {
  const { t, i18n } = useTranslation(); const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [sent, setSent] = useState(new Set()); const [sending, setSending] = useState(new Set())
  const [selectedJob, setSelectedJob] = useState(null)
  const location = useLocation()
  const selectedJobId = useRef(new URLSearchParams(location.search).get('jobId'))
  const language = i18n.resolvedLanguage || i18n.language
  const openingId = useRef(globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
  const inFlight = useRef(null)
  const load = useCallback(async (viewId) => {
    const requestKey = viewId ? `${viewId}:${language}` : null
    if (requestKey && inFlight.current?.viewId === requestKey) return inFlight.current.promise
    setLoading(true); setError('')
    const request = api.get('/jobs/recommendations', { params: { language, ...(viewId ? { recommendationViewId: viewId } : {}) } })
    const promise = request.then(async (response) => { const matches = response.data.data.recommendations || []; console.table(matches.map(({ job, finalScore, skillScore, constraintScore, locationScore, conflictPenalty }) => ({ job: job?.jobTitle, finalScore, skillScore, constraintScore, locationScore, conflictPenalty }))); setItems(matches); const ids = matches.map(({ job }) => job?._id).filter(Boolean); if (ids.length) { const saved = await api.get('/notifications/requests/sent', { params: { type: 'contact_request', ids: ids.join(',') } }); setSent(new Set(saved.data.data.requests.map(({ jobPost }) => String(jobPost)))) }; if (selectedJobId.current) setSelectedJob(matches.find(({ job }) => String(job._id) === String(selectedJobId.current))?.job || null) }).catch((requestError) => { setError(requestError.response?.data?.message || t('findJobs.loadFailed')) }).finally(() => { setLoading(false); if (inFlight.current?.promise === promise) inFlight.current = null })
    if (requestKey) inFlight.current = { viewId: requestKey, promise }
    return promise
  }, [t, language])
  useEffect(() => { load(openingId.current) }, [load])
  const requestContact = async (event, jobId) => { event.stopPropagation(); if (sent.has(String(jobId)) || sending.has(String(jobId))) return; setSending((current) => new Set(current).add(String(jobId))); try { await api.post('/notifications/requests', { type: 'contact_request', jobPostId: jobId }); setSent((current) => new Set(current).add(String(jobId))) } catch (requestError) { setError(requestError.response?.data?.message || t('notifications.actionFailed')) } finally { setSending((current) => { const next = new Set(current); next.delete(String(jobId)); return next }) } }
  if (selectedJob) return <JobPostDetails post={selectedJob} onBack={() => { selectedJobId.current = null; setSelectedJob(null) }} />
  return <section className="fj-profile-page"><div className="fj-page-title"><div><p>{t('findJobs.workspace')}</p><h1>{t('findJobs.recommendations')}</h1><span>{t('findJobs.recommendationIntro')}</span></div><button className="fj-submit" type="button" onClick={() => load()} disabled={loading}>{loading ? t('findJobs.findingMatches') : t('findJobs.refreshRecommendations')}</button></div>{loading && <section className="fj-profile-status"><i className="fj-spinner fj-profile-spinner" aria-hidden="true" /> {t('findJobs.findingMatches')}</section>}{error && <section className="fj-profile-status fj-error" role="alert">{error}</section>}{!loading && !error && !items.length && <p className="fj-profile-empty">{t('findJobs.noRecommendedJobs')}</p>}<div className="fj-recommendation-grid">{items.map(({ job }) => <article className="fj-recommendation-card" key={job._id}><button className="recommendation-card-open" type="button" onClick={() => { selectedJobId.current = job._id; setSelectedJob(job) }}><h2>{job.jobTitle}</h2><p>{job.description}</p><span>{t('findJobs.viewJobDetails')} →</span></button><button className="recommendation-request-button" type="button" disabled={sent.has(String(job._id)) || sending.has(String(job._id))} onClick={(event) => requestContact(event, job._id)}>{sent.has(String(job._id)) ? t('notifications.requestSent') : sending.has(String(job._id)) ? t('notifications.sending') : t('notifications.requestContact')}</button></article>)}</div></section>
}

function ProfileView() {
  const { t, i18n } = useTranslation()
  const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const language = i18n.resolvedLanguage || i18n.language
  useEffect(() => {
    let active = true
    api.get('/jobs/profile', { params: { language } }).then((response) => { if (active) setProfile(response.data.data.profile) }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || t('findJobs.loadFailed')) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [language, t])
  if (loading) return <section className="fj-profile-status"><i className="fj-spinner fj-profile-spinner" aria-hidden="true" /> {t('findJobs.loading')}</section>
  if (error) return <section className="fj-profile-status fj-error" role="alert">{error}</section>
  return <CandidateProfileDetails profile={profile} workspaceLabel={t('findJobs.workspace')} title={t('findJobs.myProfile')} subtitle={t('findJobs.profileReadOnly')} />
}

function CreateProfile({ profile, loadingProfile, onSaved }) {
  const { t, i18n } = useTranslation(); const [submitted, setSubmitted] = useState(false); const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false); const [profilePicturePreview, setProfilePicturePreview] = useState(null); const formRef = useRef(null); const profilePictureInputRef = useRef(null); const inputRefs = useRef({})
  useEffect(() => () => { if (profilePicturePreview) URL.revokeObjectURL(profilePicturePreview.url) }, [profilePicturePreview])
  useEffect(() => {
    if (!submitted) return undefined
    const timeout = window.setTimeout(() => setSubmitted(false), 4000)
    return () => window.clearTimeout(timeout)
  }, [submitted])
  const markUnsaved = (event) => event.target?.closest('.fj-field, .fj-file-drop, .fj-avatar-upload')?.classList.add('is-dirty')
  const applyVoiceInput = (name, transcript) => { const input = inputRefs.current[name]; if (!input || !transcript) return; input.value = input.tagName === 'TEXTAREA' && input.value.trim() ? `${input.value.trim()} ${transcript}` : transcript; input.dispatchEvent(new Event('input', { bubbles: true })); input.closest('.fj-field')?.classList.add('is-dirty') }
  const removeProfilePicture = () => { if (profilePictureInputRef.current) profilePictureInputRef.current.value = ''; setProfilePicturePreview(null); profilePictureInputRef.current?.closest('.fj-avatar-upload')?.classList.add('is-dirty') }
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    setSubmitting(true); setError(''); setSubmitted(false)
    try {
      const response = await api.post('/jobs/profile', new FormData(event.currentTarget))
      onSaved(response.data.data.profile)
      formRef.current?.querySelectorAll('.is-dirty').forEach((element) => element.classList.remove('is-dirty'))
      setProfilePicturePreview(null)
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.response?.data?.message || t('findJobs.saveFailed'))
    } finally { setSubmitting(false) }
  }
  if (loadingProfile) return <section className="fj-profile-status"><i className="fj-spinner fj-profile-spinner" aria-hidden="true" /> {t('findJobs.loading')}</section>
  const isUpdate = Boolean(profile)
  return <form ref={formRef} className="fj-form" onSubmit={handleSubmit} onChange={markUnsaved} encType="multipart/form-data"><input type="hidden" name="inputLanguage" value={i18n.resolvedLanguage || i18n.language || 'en'} />
    <div className="fj-page-title"><div><p>{t('findJobs.workspace')}</p><h1>{t(isUpdate ? 'findJobs.update' : 'findJobs.create')}</h1><span>{t('findJobs.createIntro')}</span></div><span className="fj-progress"><b>01</b> / 03</span></div>
    <section className="fj-section"><div className="fj-section-heading"><span className="fj-section-number">01</span><div><h2>{t('findJobs.personal')}</h2><p>{t('findJobs.personalHelp')}</p></div></div><div className="fj-grid fj-grid-2">{fields.slice(0, 4).map((field) => <label className="fj-field" key={field.name}><span>{t(`findJobs.${field.name}`)} {field.required && <em>*</em>}</span><input ref={(element) => { inputRefs.current[field.name] = element }} name={field.name} type={field.type} min={field.min} max={field.max} required={field.required} defaultValue={profile?.[field.name] || ''} placeholder={t(`findJobs.${field.name}Placeholder`)} /><VoiceInputButton className="fj-voice-input" onTranscript={(transcript) => applyVoiceInput(field.name, transcript)} /></label>)}</div><div className="fj-grid fj-grid-3">{fields.slice(4).map((field) => <label className="fj-field" key={field.name}><span>{t(`findJobs.${field.name}`)}</span><input ref={(element) => { inputRefs.current[field.name] = element }} name={field.name} pattern={field.pattern} defaultValue={profile?.[field.name] || ''} placeholder={t(`findJobs.${field.name}Placeholder`)} /><VoiceInputButton className="fj-voice-input" onTranscript={(transcript) => applyVoiceInput(field.name, transcript)} /></label>)}</div><div className="fj-upload-field"><span>{t('findJobs.profilePicture')}</span><div className="fj-avatar-row"><label className="fj-avatar-upload"><input ref={profilePictureInputRef} name="profilePicture" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; setProfilePicturePreview(file ? { file, url: URL.createObjectURL(file) } : null) }} /><FiImage /><span>{t('findJobs.addProfilePhoto')}</span></label><p>{profile?.profilePicture ? t('findJobs.currentPhoto') : t('findJobs.photoHelp')}</p></div><MediaPreview previews={profilePicturePreview ? [profilePicturePreview] : []} onRemove={removeProfilePicture} /></div></section>
    <section className="fj-section"><div className="fj-section-heading"><span className="fj-section-number">02</span><div><h2>{t('findJobs.educationWork')}</h2><p>{t('findJobs.educationHelp')}</p></div></div><div className="fj-grid fj-grid-2"><label className="fj-field"><span>{t('findJobs.qualification')}</span><input ref={(element) => { inputRefs.current.qualification = element }} name="qualification" defaultValue={profile?.qualification || ''} placeholder={t('findJobs.qualificationPlaceholder')} /><VoiceInputButton className="fj-voice-input" onTranscript={(transcript) => applyVoiceInput('qualification', transcript)} /></label><label className="fj-field"><span>{t('findJobs.portfolio')}</span><div className="fj-input-icon"><FiLink /><input ref={(element) => { inputRefs.current.portfolio = element }} name="portfolio" type="url" defaultValue={profile?.portfolio || ''} placeholder={t('findJobs.portfolioPlaceholder')} /></div><VoiceInputButton className="fj-voice-input" onTranscript={(transcript) => applyVoiceInput('portfolio', transcript)} /></label></div><label className="fj-field"><span>{t('findJobs.skills')}</span><textarea ref={(element) => { inputRefs.current.skills = element }} name="skills" defaultValue={profile?.skills || ''} placeholder={t('findJobs.skillsPlaceholder')} /><VoiceInputButton className="fj-voice-input" onTranscript={(transcript) => applyVoiceInput('skills', transcript)} /></label><div className="fj-grid fj-grid-2"><label className="fj-field"><span>{t('findJobs.previousJobs')}</span><textarea ref={(element) => { inputRefs.current.previousJobs = element }} name="previousJobs" defaultValue={profile?.previousJobs || ''} placeholder={t('findJobs.previousJobsPlaceholder')} /><VoiceInputButton className="fj-voice-input" onTranscript={(transcript) => applyVoiceInput('previousJobs', transcript)} /></label><label className="fj-field"><span>{t('findJobs.roles')}</span><textarea ref={(element) => { inputRefs.current.roles = element }} name="roles" defaultValue={profile?.roles || ''} placeholder={t('findJobs.rolesPlaceholder')} /><VoiceInputButton className="fj-voice-input" onTranscript={(transcript) => applyVoiceInput('roles', transcript)} /></label></div><div className="fj-grid fj-grid-2"><label className="fj-field"><span>{t('findJobs.skillsApplied')}</span><textarea ref={(element) => { inputRefs.current.skillsApplied = element }} name="skillsApplied" defaultValue={profile?.skillsApplied || ''} placeholder={t('findJobs.skillsAppliedPlaceholder')} /><VoiceInputButton className="fj-voice-input" onTranscript={(transcript) => applyVoiceInput('skillsApplied', transcript)} /></label><label className="fj-field"><span>{t('findJobs.certifications')}</span><textarea ref={(element) => { inputRefs.current.certifications = element }} name="certifications" defaultValue={profile?.certifications || ''} placeholder={t('findJobs.certificationsPlaceholder')} /><VoiceInputButton className="fj-voice-input" onTranscript={(transcript) => applyVoiceInput('certifications', transcript)} /></label></div><div className="fj-upload-grid"><div className="fj-upload-field"><span>{t('findJobs.certificationAttachments')}</span><FileDrop name="certificationAttachments" label={t('findJobs.attachCertificates')} hint={t(profile?.certificationAttachments?.length ? 'findJobs.currentAttachments' : 'findJobs.uploadAttachments')} accept="image/*,.pdf,.doc,.docx" icon={FiFileText} multiple onDirty={markUnsaved} /></div><div className="fj-upload-field"><span>{t('findJobs.resume')}</span><FileDrop name="resume" label={t('findJobs.uploadResume')} hint={t(profile?.resume ? 'findJobs.currentResume' : 'findJobs.resumeHint')} accept=".pdf,.doc,.docx" icon={FiFileText} onDirty={markUnsaved} /></div><div className="fj-upload-field"><span>{t('findJobs.workSamples')}</span><FileDrop name="workSamples" label={t('findJobs.uploadWorkSamples')} hint={t(profile?.workSamples ? 'findJobs.currentSamples' : 'findJobs.uploadSamples')} accept="image/*,video/*,.pdf,.doc,.docx" icon={FiImage} multiple onDirty={markUnsaved} /></div></div></section>
    <section className="fj-section"><div className="fj-section-heading"><span className="fj-section-number">03</span><div><h2>{t('findJobs.preferences')}</h2><p>{t('findJobs.preferencesHelp')}</p></div></div><label className="fj-field"><span>{t('findJobs.yourPreferences')}</span><textarea ref={(element) => { inputRefs.current.preferences = element }} className="fj-large-textarea" name="preferences" defaultValue={profile?.preferences || ''} placeholder={t('findJobs.preferencesPlaceholder')} /><VoiceInputButton className="fj-voice-input" onTranscript={(transcript) => applyVoiceInput('preferences', transcript)} /></label></section><div className="fj-submit-row"><span>{t('findJobs.requiredNote')}</span><button className="fj-submit" type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? <><i className="fj-spinner" aria-hidden="true" /> {t('findJobs.saving')}</> : <>{t(isUpdate ? 'findJobs.saveChanges' : 'findJobs.saveProfile')} <FiCheckCircle /></>}</button></div>{submitted && <div className="fj-toast" role="status"><FiCheckCircle /><div><strong>{t('findJobs.profileSaved')}</strong><span>{t('findJobs.profileSavedText')}</span></div></div>}{error && <div className="fj-success fj-error" role="alert">{error}</div>}
  </form>
}

function FindJobsPage() {
  const { t } = useTranslation(); const location = useLocation(); const [page, setPage] = useState(new URLSearchParams(location.search).has('jobId') ? 'recommendations' : 'create'); const [profileDraft, setProfileDraft] = useState(null); const [loadingProfile, setLoadingProfile] = useState(true)
  useEffect(() => {
    let active = true
    api.get('/jobs/profile').then((response) => { if (active) setProfileDraft(response.data.data.profile) }).catch((requestError) => { if (requestError.response?.status !== 404 && active) setProfileDraft(null) }).finally(() => { if (active) setLoadingProfile(false) })
    return () => { active = false }
  }, [])
  const createLabel = t(profileDraft ? 'findJobs.update' : 'findJobs.create')
  return <div className="find-jobs-shell"><div className="fj-layout"><div className="fj-profile-corner"><ProfileMenu /></div><aside className="fj-sidebar"><div className="fj-sidebar-top"><a className="fj-brand" href="/"><img src={logo} alt="" /><span>Wiryaa</span></a></div><a className="fj-sidebar-home" href="/"><FiHome /> <span>{t('findJobs.dashboard')}</span></a><p>{t('findJobs.yourJourney')}</p>{navItems.map(({ id, icon: Icon }) => <button key={id} type="button" className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon /><span>{id === 'create' ? createLabel : t(`findJobs.${id}`)}</span>{page === id && <i />}</button>)}<div className="fj-sidebar-tip"><FiUsers /><span>{t('findJobs.tip')}</span></div></aside><header className="fj-mobile-header"><a className="fj-brand" href="/"><img src={logo} alt="" /><span>Wiryaa</span></a><span>{t('findJobs.workspace')}</span></header><nav className="fj-mobile-nav" aria-label={t('findJobs.yourJourney')}>{navItems.map(({ id, icon: Icon }) => <button key={id} type="button" className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon /><span>{id === 'create' ? createLabel : t(`findJobs.${id}`)}</span></button>)}</nav><main className="fj-content">{page === 'create' ? <CreateProfile key={profileDraft?._id || 'new'} profile={profileDraft} loadingProfile={loadingProfile} onSaved={setProfileDraft} /> : page === 'profile' ? <ProfileView /> : page === 'connections' ? <Connections workspace="findJobs" /> : <Recommendations />}</main></div></div>
}
export default FindJobsPage
