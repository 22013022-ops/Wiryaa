import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiBriefcase, FiCheckCircle, FiFileText, FiHome, FiImage, FiLink, FiPlus, FiUser, FiUsers } from 'react-icons/fi'
import '../styles/FindJobsPage.css'
import logo from '../assets/icons/wiryaa-monogram.png'
import ProfileMenu from '../components/layout/ProfileMenu'
import api from '../services/api'

const fields = [{ name: 'name', type: 'text', required: true }, { name: 'email', type: 'email' }, { name: 'phone', type: 'tel', required: true }, { name: 'age', type: 'number', required: true, min: 16, max: 100 }, { name: 'state' }, { name: 'city' }, { name: 'pincode', pattern: '[0-9]{6}' }]
const navItems = [{ id: 'create', icon: FiPlus }, { id: 'profile', icon: FiUser }, { id: 'recommendations', icon: FiBriefcase }]

function FileDrop({ name, label, hint, accept, icon: Icon }) {
  const [fileName, setFileName] = useState('')
  return <label className="fj-file-drop"><input name={name} type="file" accept={accept} onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} /><span className="fj-file-icon"><Icon /></span><span><strong>{fileName || label}</strong><small>{fileName || hint}</small></span></label>
}

function ComingSoon({ page }) {
  const { t } = useTranslation(); const Icon = page === 'profile' ? FiUser : FiBriefcase
  return <section className="fj-coming-soon"><span className="fj-coming-icon"><Icon /></span><p>{t('findJobs.workspace')}</p><h1>{t(`findJobs.${page}`)}</h1><span>{t('findJobs.comingSoon')}</span></section>
}

function CreateProfile() {
  const { t } = useTranslation(); const [submitted, setSubmitted] = useState(false); const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false)
  useEffect(() => {
    if (!submitted) return undefined
    const timeout = window.setTimeout(() => setSubmitted(false), 4000)
    return () => window.clearTimeout(timeout)
  }, [submitted])
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    setSubmitting(true); setError(''); setSubmitted(false)
    try {
      await api.post('/jobs/profile', new FormData(event.currentTarget))
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save your profile. Please try again.')
    } finally { setSubmitting(false) }
  }
  return <form className="fj-form" onSubmit={handleSubmit} encType="multipart/form-data">
    <div className="fj-page-title"><div><p>{t('findJobs.workspace')}</p><h1>{t('findJobs.create')}</h1><span>{t('findJobs.createIntro')}</span></div><span className="fj-progress"><b>01</b> / 03</span></div>
    <section className="fj-section"><div className="fj-section-heading"><span className="fj-section-number">01</span><div><h2>{t('findJobs.personal')}</h2><p>{t('findJobs.personalHelp')}</p></div></div><div className="fj-grid fj-grid-2">{fields.slice(0, 4).map((field) => <label className="fj-field" key={field.name}><span>{t(`findJobs.${field.name}`)} {field.required && <em>*</em>}</span><input name={field.name} type={field.type} min={field.min} max={field.max} required={field.required} placeholder={t(`findJobs.${field.name}Placeholder`)} /></label>)}</div><div className="fj-grid fj-grid-3">{fields.slice(4).map((field) => <label className="fj-field" key={field.name}><span>{t(`findJobs.${field.name}`)}</span><input name={field.name} pattern={field.pattern} placeholder={t(`findJobs.${field.name}Placeholder`)} /></label>)}</div><div className="fj-upload-field"><span>{t('findJobs.profilePicture')}</span><div className="fj-avatar-row"><label className="fj-avatar-upload"><input name="profilePicture" type="file" accept="image/*" /><FiImage /><span>{t('findJobs.addProfilePhoto')}</span></label><p>{t('findJobs.photoHelp')}</p></div></div></section>
    <section className="fj-section"><div className="fj-section-heading"><span className="fj-section-number">02</span><div><h2>{t('findJobs.educationWork')}</h2><p>{t('findJobs.educationHelp')}</p></div></div><div className="fj-grid fj-grid-2"><label className="fj-field"><span>{t('findJobs.qualification')}</span><input name="qualification" placeholder={t('findJobs.qualificationPlaceholder')} /></label><label className="fj-field"><span>{t('findJobs.portfolio')}</span><div className="fj-input-icon"><FiLink /><input name="portfolio" type="url" placeholder={t('findJobs.portfolioPlaceholder')} /></div></label></div><label className="fj-field"><span>{t('findJobs.skills')}</span><textarea name="skills" placeholder={t('findJobs.skillsPlaceholder')} /></label><div className="fj-grid fj-grid-2"><label className="fj-field"><span>{t('findJobs.previousJobs')}</span><textarea name="previousJobs" placeholder={t('findJobs.previousJobsPlaceholder')} /></label><label className="fj-field"><span>{t('findJobs.roles')}</span><textarea name="roles" placeholder={t('findJobs.rolesPlaceholder')} /></label></div><div className="fj-grid fj-grid-2"><label className="fj-field"><span>{t('findJobs.skillsApplied')}</span><textarea name="skillsApplied" placeholder={t('findJobs.skillsAppliedPlaceholder')} /></label><label className="fj-field"><span>{t('findJobs.certifications')}</span><textarea name="certifications" placeholder={t('findJobs.certificationsPlaceholder')} /></label></div><div className="fj-upload-grid"><div className="fj-upload-field"><span>{t('findJobs.resume')}</span><FileDrop name="resume" label={t('findJobs.uploadResume')} hint={t('findJobs.resumeHint')} accept=".pdf,.doc,.docx" icon={FiFileText} /></div><div className="fj-upload-field"><span>{t('findJobs.workSamples')}</span><FileDrop name="workSamples" label={t('findJobs.uploadWorkSamples')} hint={t('findJobs.workSamplesHint')} accept="image/*,video/*,.pdf,.doc,.docx" icon={FiImage} /></div></div></section>
    <section className="fj-section"><div className="fj-section-heading"><span className="fj-section-number">03</span><div><h2>{t('findJobs.preferences')}</h2><p>{t('findJobs.preferencesHelp')}</p></div></div><label className="fj-field"><span>{t('findJobs.yourPreferences')}</span><textarea className="fj-large-textarea" name="preferences" placeholder={t('findJobs.preferencesPlaceholder')} /></label></section><div className="fj-submit-row"><span>{t('findJobs.requiredNote')}</span><button className="fj-submit" type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? <><i className="fj-spinner" aria-hidden="true" /> Saving profile…</> : <>{t('findJobs.saveProfile')} <FiCheckCircle /></>}</button></div>{submitted && <div className="fj-toast" role="status"><FiCheckCircle /><div><strong>Profile saved</strong><span>Your profile details have been saved successfully.</span></div></div>}{error && <div className="fj-success fj-error" role="alert">{error}</div>}
  </form>
}

function FindJobsPage() {
  const { t } = useTranslation(); const [page, setPage] = useState('create')
  return <div className="find-jobs-shell"><div className="fj-layout"><div className="fj-profile-corner"><ProfileMenu /></div><aside className="fj-sidebar"><div className="fj-sidebar-top"><a className="fj-brand" href="/"><img src={logo} alt="" /><span>Wiryaa</span></a></div><a className="fj-sidebar-home" href="/"><FiHome /> <span>{t('findJobs.dashboard')}</span></a><p>{t('findJobs.yourJourney')}</p>{navItems.map(({ id, icon: Icon }) => <button key={id} type="button" className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon /><span>{t(`findJobs.${id}`)}</span>{page === id && <i />}</button>)}<div className="fj-sidebar-tip"><FiUsers /><span>{t('findJobs.tip')}</span></div></aside><header className="fj-mobile-header"><a className="fj-brand" href="/"><img src={logo} alt="" /><span>Wiryaa</span></a><span>{t('findJobs.workspace')}</span></header><nav className="fj-mobile-nav" aria-label={t('findJobs.yourJourney')}>{navItems.map(({ id, icon: Icon }) => <button key={id} type="button" className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon /><span>{t(`findJobs.${id}`)}</span></button>)}</nav><main className="fj-content">{page === 'create' ? <CreateProfile /> : <ComingSoon page={page} />}</main></div></div>
}
export default FindJobsPage
