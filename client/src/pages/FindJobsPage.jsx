import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiAward, FiBriefcase, FiCheckCircle, FiExternalLink, FiFileText, FiHome, FiImage, FiLink, FiMail, FiMapPin, FiPhone, FiPlus, FiUser, FiUsers } from 'react-icons/fi'
import '../styles/FindJobsPage.css'
import logo from '../assets/icons/wiryaa-monogram.png'
import ProfileMenu from '../components/layout/ProfileMenu'
import api from '../services/api'

const fields = [{ name: 'name', type: 'text', required: true }, { name: 'email', type: 'email' }, { name: 'phone', type: 'tel', required: true }, { name: 'age', type: 'number', required: true, min: 16, max: 100 }, { name: 'state' }, { name: 'city' }, { name: 'pincode', pattern: '[0-9]{6}' }]
const navItems = [{ id: 'create', icon: FiPlus }, { id: 'profile', icon: FiUser }, { id: 'recommendations', icon: FiBriefcase }]

function FileDrop({ name, label, hint, accept, icon: Icon, multiple = false }) {
  const [fileName, setFileName] = useState('')
  const [previews, setPreviews] = useState([])
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews])
  const selectFiles = (event) => { const files = Array.from(event.target.files || []); setPreviews(files.map((file) => ({ file, url: URL.createObjectURL(file) }))); setFileName(files.length > 1 ? `${files.length} files selected` : files[0]?.name || '') }
  return <><label className="fj-file-drop"><input name={name} type="file" accept={accept} multiple={multiple} onChange={selectFiles} /><span className="fj-file-icon"><Icon /></span><span><strong>{fileName || label}</strong><small>{fileName || hint}</small></span></label><MediaPreview previews={previews} /></>
}

function MediaPreview({ previews }) {
  if (!previews.length) return null
  return <div className="fj-media-preview" aria-label="Selected file previews">{previews.map(({ file, url }) => file.type.startsWith('image/') ? <div className="fj-media-preview-item" key={url}><img src={url} alt={file.name} /><span>{file.name}</span></div> : file.type.startsWith('video/') ? <div className="fj-media-preview-item" key={url}><video controls preload="metadata"><source src={url} /></video><span>{file.name}</span></div> : <div className="fj-media-preview-item fj-document-preview" key={url}><FiFileText /><span>{file.name}</span></div>)}</div>
}

function ComingSoon({ page }) {
  const { t } = useTranslation(); const Icon = page === 'profile' ? FiUser : FiBriefcase
  return <section className="fj-coming-soon"><span className="fj-coming-icon"><Icon /></span><p>{t('findJobs.workspace')}</p><h1>{t(`findJobs.${page}`)}</h1><span>{t('findJobs.comingSoon')}</span></section>
}

function AssetGallery({ assets = [], emptyMessage }) {
  if (!assets.length) return <p className="fj-profile-empty">{emptyMessage}</p>
  return <div className="fj-asset-gallery">{assets.map((asset) => asset.resource_type === 'image' ? <a key={asset.public_id} className="fj-image-asset" href={asset.secure_url} target="_blank" rel="noreferrer"><img src={asset.secure_url} alt="Uploaded profile asset" /></a> : asset.resource_type === 'video' ? <video key={asset.public_id} className="fj-video-asset" controls preload="metadata"><source src={asset.secure_url} /></video> : <a key={asset.public_id} className="fj-document-asset" href={asset.secure_url} target="_blank" rel="noreferrer"><FiFileText /><span>View attachment</span><FiExternalLink /></a>)}</div>
}

function ProfileView() {
  const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    api.get('/jobs/profile').then((response) => { if (active) setProfile(response.data.data.profile) }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Unable to load your profile.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  if (loading) return <section className="fj-profile-status"><i className="fj-spinner fj-profile-spinner" aria-hidden="true" /> Loading profile…</section>
  if (error) return <section className="fj-profile-status fj-error" role="alert">{error}</section>
  const location = [profile.city, profile.state].filter(Boolean).join(', ') || 'Location not added'
  const workSamples = profile.workSamples ? [profile.workSamples] : []
  return <article className="fj-profile-page">
    <div className="fj-page-title"><div><p>Career workspace</p><h1>My profile</h1><span>A read-only view of the information shared with employers.</span></div></div>
    <nav className="fj-profile-nav" aria-label="Profile sections"><a href="#about">About</a><a href="#skills">Skills</a><a href="#experience">Experience</a><a href="#work-samples">Work Samples</a><a href="#resume">Resume</a></nav>
    <header className="fj-profile-header"><div className="fj-profile-photo">{profile.profilePicture?.secure_url ? <img src={profile.profilePicture.secure_url} alt={`${profile.name}'s profile`} /> : <FiUser aria-label="Profile photo unavailable" />}</div><div className="fj-profile-title"><h2>{profile.name}</h2><span>{profile.age ? `${profile.age} years old` : 'Age not added'}</span><div className="fj-profile-contact">{profile.email && <a href={`mailto:${profile.email}`}><FiMail /> {profile.email}</a>}<a href={`tel:${profile.phone}`}><FiPhone /> {profile.phone}</a><span><FiMapPin /> {location}</span></div></div></header>
    <section className="fj-profile-card" id="about"><h2>About</h2><p>{profile.preferences || 'No preferences or work constraints added yet.'}</p></section>
    <section className="fj-profile-card" id="skills"><h2>Skills</h2><p>{profile.skills || 'No skills added yet.'}</p></section>
    <section className="fj-profile-card" id="experience"><h2>Experience & education</h2><div className="fj-profile-details"><div><span>Highest qualification</span><p>{profile.qualification || 'Not added'}</p></div><div><span>Previous jobs / internships</span><p>{profile.previousJobs || 'Not added'}</p></div><div><span>Roles & responsibilities</span><p>{profile.roles || 'Not added'}</p></div></div></section>
    <section className="fj-profile-card"><h2><FiAward /> Certifications & achievements</h2>{profile.certifications && <p>{profile.certifications}</p>}<AssetGallery assets={profile.certificationAttachments || []} emptyMessage={profile.certifications ? 'No certificate attachments added.' : 'No certifications or achievements added yet.'} /></section>
    <section className="fj-profile-card" id="work-samples"><h2>Work samples</h2><AssetGallery assets={workSamples} emptyMessage="No work samples added yet." /></section>
    <section className="fj-profile-card fj-profile-resources" id="resume"><div><h2>Resume</h2><p>Open your uploaded resume in a new tab.</p></div>{profile.resume ? <a className="fj-resource-link" href={profile.resume.secure_url} target="_blank" rel="noreferrer"><FiFileText /> View resume <FiExternalLink /></a> : <span className="fj-profile-empty">No resume added yet.</span>}<div className="fj-portfolio-resource"><h2>Portfolio / Links</h2>{profile.portfolio ? <a className="fj-resource-link" href={profile.portfolio} target="_blank" rel="noreferrer"><FiLink /> View Portfolio <FiExternalLink /></a> : <span className="fj-profile-empty">No portfolio link added yet.</span>}</div></section>
  </article>
}

function CreateProfile({ profile, loadingProfile, onSaved }) {
  const { t } = useTranslation(); const [submitted, setSubmitted] = useState(false); const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false); const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  useEffect(() => () => { if (profilePicturePreview) URL.revokeObjectURL(profilePicturePreview.url) }, [profilePicturePreview])
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
      const response = await api.post('/jobs/profile', new FormData(event.currentTarget))
      onSaved(response.data.data.profile)
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save your profile. Please try again.')
    } finally { setSubmitting(false) }
  }
  if (loadingProfile) return <section className="fj-profile-status"><i className="fj-spinner fj-profile-spinner" aria-hidden="true" /> Loading profile…</section>
  const isUpdate = Boolean(profile)
  return <form className="fj-form" onSubmit={handleSubmit} encType="multipart/form-data">
    <div className="fj-page-title"><div><p>{t('findJobs.workspace')}</p><h1>{isUpdate ? 'Update Profile' : t('findJobs.create')}</h1><span>{t('findJobs.createIntro')}</span></div><span className="fj-progress"><b>01</b> / 03</span></div>
    <section className="fj-section"><div className="fj-section-heading"><span className="fj-section-number">01</span><div><h2>{t('findJobs.personal')}</h2><p>{t('findJobs.personalHelp')}</p></div></div><div className="fj-grid fj-grid-2">{fields.slice(0, 4).map((field) => <label className="fj-field" key={field.name}><span>{t(`findJobs.${field.name}`)} {field.required && <em>*</em>}</span><input name={field.name} type={field.type} min={field.min} max={field.max} required={field.required} defaultValue={profile?.[field.name] || ''} placeholder={t(`findJobs.${field.name}Placeholder`)} /></label>)}</div><div className="fj-grid fj-grid-3">{fields.slice(4).map((field) => <label className="fj-field" key={field.name}><span>{t(`findJobs.${field.name}`)}</span><input name={field.name} pattern={field.pattern} defaultValue={profile?.[field.name] || ''} placeholder={t(`findJobs.${field.name}Placeholder`)} /></label>)}</div><div className="fj-upload-field"><span>{t('findJobs.profilePicture')}</span><div className="fj-avatar-row"><label className="fj-avatar-upload"><input name="profilePicture" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; setProfilePicturePreview(file ? { file, url: URL.createObjectURL(file) } : null) }} /><FiImage /><span>{t('findJobs.addProfilePhoto')}</span></label><p>{profile?.profilePicture ? 'Your current photo will be kept unless you upload a replacement.' : t('findJobs.photoHelp')}</p></div><MediaPreview previews={profilePicturePreview ? [profilePicturePreview] : []} /></div></section>
    <section className="fj-section"><div className="fj-section-heading"><span className="fj-section-number">02</span><div><h2>{t('findJobs.educationWork')}</h2><p>{t('findJobs.educationHelp')}</p></div></div><div className="fj-grid fj-grid-2"><label className="fj-field"><span>{t('findJobs.qualification')}</span><input name="qualification" defaultValue={profile?.qualification || ''} placeholder={t('findJobs.qualificationPlaceholder')} /></label><label className="fj-field"><span>{t('findJobs.portfolio')}</span><div className="fj-input-icon"><FiLink /><input name="portfolio" type="url" defaultValue={profile?.portfolio || ''} placeholder={t('findJobs.portfolioPlaceholder')} /></div></label></div><label className="fj-field"><span>{t('findJobs.skills')}</span><textarea name="skills" defaultValue={profile?.skills || ''} placeholder={t('findJobs.skillsPlaceholder')} /></label><div className="fj-grid fj-grid-2"><label className="fj-field"><span>{t('findJobs.previousJobs')}</span><textarea name="previousJobs" defaultValue={profile?.previousJobs || ''} placeholder={t('findJobs.previousJobsPlaceholder')} /></label><label className="fj-field"><span>{t('findJobs.roles')}</span><textarea name="roles" defaultValue={profile?.roles || ''} placeholder={t('findJobs.rolesPlaceholder')} /></label></div><div className="fj-grid fj-grid-2"><label className="fj-field"><span>{t('findJobs.skillsApplied')}</span><textarea name="skillsApplied" defaultValue={profile?.skillsApplied || ''} placeholder={t('findJobs.skillsAppliedPlaceholder')} /></label><label className="fj-field"><span>{t('findJobs.certifications')}</span><textarea name="certifications" defaultValue={profile?.certifications || ''} placeholder={t('findJobs.certificationsPlaceholder')} /></label></div><div className="fj-upload-grid"><div className="fj-upload-field"><span>Certification attachments</span><FileDrop name="certificationAttachments" label="Attach certificates or achievements" hint={profile?.certificationAttachments?.length ? 'Current attachments will be kept; upload to replace them.' : 'Upload up to 5 images, PDFs, DOC or DOCX files'} accept="image/*,.pdf,.doc,.docx" icon={FiFileText} multiple /></div><div className="fj-upload-field"><span>{t('findJobs.resume')}</span><FileDrop name="resume" label={t('findJobs.uploadResume')} hint={profile?.resume ? 'Your current resume will be kept unless replaced.' : t('findJobs.resumeHint')} accept=".pdf,.doc,.docx" icon={FiFileText} /></div><div className="fj-upload-field"><span>{t('findJobs.workSamples')}</span><FileDrop name="workSamples" label={t('findJobs.uploadWorkSamples')} hint={profile?.workSamples ? 'Your current work sample will be kept unless replaced.' : t('findJobs.workSamplesHint')} accept="image/*,video/*,.pdf,.doc,.docx" icon={FiImage} /></div></div></section>
    <section className="fj-section"><div className="fj-section-heading"><span className="fj-section-number">03</span><div><h2>{t('findJobs.preferences')}</h2><p>{t('findJobs.preferencesHelp')}</p></div></div><label className="fj-field"><span>{t('findJobs.yourPreferences')}</span><textarea className="fj-large-textarea" name="preferences" defaultValue={profile?.preferences || ''} placeholder={t('findJobs.preferencesPlaceholder')} /></label></section><div className="fj-submit-row"><span>{t('findJobs.requiredNote')}</span><button className="fj-submit" type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? <><i className="fj-spinner" aria-hidden="true" /> Saving profile…</> : <>{isUpdate ? 'Save Changes' : 'Save My Profile'} <FiCheckCircle /></>}</button></div>{submitted && <div className="fj-toast" role="status"><FiCheckCircle /><div><strong>Profile saved</strong><span>Your profile details have been saved successfully.</span></div></div>}{error && <div className="fj-success fj-error" role="alert">{error}</div>}
  </form>
}

function FindJobsPage() {
  const { t } = useTranslation(); const [page, setPage] = useState('create'); const [profileDraft, setProfileDraft] = useState(null); const [loadingProfile, setLoadingProfile] = useState(true)
  useEffect(() => {
    let active = true
    api.get('/jobs/profile').then((response) => { if (active) setProfileDraft(response.data.data.profile) }).catch((requestError) => { if (requestError.response?.status !== 404 && active) setProfileDraft(null) }).finally(() => { if (active) setLoadingProfile(false) })
    return () => { active = false }
  }, [])
  const createLabel = profileDraft ? 'Update Profile' : t('findJobs.create')
  return <div className="find-jobs-shell"><div className="fj-layout"><div className="fj-profile-corner"><ProfileMenu /></div><aside className="fj-sidebar"><div className="fj-sidebar-top"><a className="fj-brand" href="/"><img src={logo} alt="" /><span>Wiryaa</span></a></div><a className="fj-sidebar-home" href="/"><FiHome /> <span>{t('findJobs.dashboard')}</span></a><p>{t('findJobs.yourJourney')}</p>{navItems.map(({ id, icon: Icon }) => <button key={id} type="button" className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon /><span>{id === 'create' ? createLabel : t(`findJobs.${id}`)}</span>{page === id && <i />}</button>)}<div className="fj-sidebar-tip"><FiUsers /><span>{t('findJobs.tip')}</span></div></aside><header className="fj-mobile-header"><a className="fj-brand" href="/"><img src={logo} alt="" /><span>Wiryaa</span></a><span>{t('findJobs.workspace')}</span></header><nav className="fj-mobile-nav" aria-label={t('findJobs.yourJourney')}>{navItems.map(({ id, icon: Icon }) => <button key={id} type="button" className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon /><span>{id === 'create' ? createLabel : t(`findJobs.${id}`)}</span></button>)}</nav><main className="fj-content">{page === 'create' ? <CreateProfile key={profileDraft?._id || 'new'} profile={profileDraft} loadingProfile={loadingProfile} onSaved={setProfileDraft} /> : page === 'profile' ? <ProfileView /> : <ComingSoon page={page} />}</main></div></div>
}
export default FindJobsPage
