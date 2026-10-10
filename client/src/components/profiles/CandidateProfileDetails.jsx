import { FiArrowLeft, FiAward, FiExternalLink, FiFileText, FiMapPin, FiPhone, FiUser } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import '../../styles/FindJobsPage.css'

export default function CandidateProfileDetails({ profile, onBack, workspaceLabel, title = profile.name, subtitle }) {
  const { t } = useTranslation()
  const location = [profile.city, profile.state].filter(Boolean).join(', ') || t('findJobs.locationNotAdded')
  const samples = Array.isArray(profile.workSamples) ? profile.workSamples : profile.workSamples ? [profile.workSamples] : []
  const assets = (items = []) => <div className="fj-asset-gallery">{items.map((asset) => asset.resource_type === 'image'
    ? <a key={asset.public_id} className="fj-image-asset" href={asset.secure_url} target="_blank" rel="noreferrer"><img src={asset.secure_url} alt={t('findJobs.uploadedAsset')} /></a>
    : asset.resource_type === 'video' ? <video key={asset.public_id} className="fj-video-asset" controls preload="metadata"><source src={asset.secure_url} /></video>
      : <a key={asset.public_id} className="fj-document-asset" href={asset.secure_url} target="_blank" rel="noreferrer"><FiFileText /><span>{t('findJobs.attachment')}</span><FiExternalLink /></a>)}</div>
  return <article className="fj-profile-page">
    {onBack && <button className="fj-back-button" type="button" onClick={onBack} aria-label={t('common.backToRecommendations')} title={t('common.backToRecommendations')}><FiArrowLeft /></button>}
    <div className="fj-page-title"><div><p>{workspaceLabel || t('hireTalents.candidateProfile')}</p><h1>{title}</h1><span>{subtitle || t('hireTalents.candidateProfileIntro')}</span></div></div>
    <header className="fj-profile-header"><div className="fj-profile-photo">{profile.profilePicture?.secure_url ? <img src={profile.profilePicture.secure_url} alt={t('findJobs.profilePhotoAlt', { name: profile.name })} /> : <FiUser />}</div><div className="fj-profile-title"><h2>{profile.name}</h2><span>{profile.age ? t('findJobs.yearsOld', { age: profile.age }) : t('findJobs.ageNotAdded')}</span><div className="fj-profile-contact">{profile.email && <span>{profile.email}</span>}{profile.phone && <a href={`tel:${profile.phone}`}><FiPhone /> {profile.phone}</a>}<span><FiMapPin /> {location}</span></div></div></header>
    <section className="fj-profile-card"><h2>{t('findJobs.about')}</h2><p>{profile.preferences || t('findJobs.noPreferences')}</p></section>
    <section className="fj-profile-card"><h2>{t('findJobs.skills')}</h2><p>{profile.skills || t('findJobs.noSkills')}</p></section>
    <section className="fj-profile-card"><h2>{t('findJobs.experienceEducation')}</h2><div className="fj-profile-details"><div><span>{t('findJobs.qualification')}</span><p>{profile.qualification || t('findJobs.notAdded')}</p></div><div><span>{t('findJobs.previousJobs')}</span><p>{profile.previousJobs || t('findJobs.notAdded')}</p></div><div><span>{t('findJobs.roles')}</span><p>{profile.roles || t('findJobs.notAdded')}</p></div><div><span>{t('findJobs.skillsApplied')}</span><p>{profile.skillsApplied || t('findJobs.notAdded')}</p></div></div></section>
    <section className="fj-profile-card"><h2><FiAward /> {t('findJobs.certifications')}</h2><p>{profile.certifications || t('findJobs.notAdded')}</p>{assets(profile.certificationAttachments)}</section>
    <section className="fj-profile-card"><h2>{t('findJobs.workSamples')}</h2>{samples.length ? assets(samples) : <p>{t('findJobs.noSamples')}</p>}</section>
    <section className="fj-profile-card fj-profile-resources"><div><h2>{t('findJobs.resume')}</h2>{profile.resume ? <a className="fj-resource-link" href={profile.resume.secure_url} target="_blank" rel="noreferrer"><FiFileText /> {t('findJobs.viewResume')} <FiExternalLink /></a> : <span>{t('findJobs.noResume')}</span>}</div><div className="fj-portfolio-resource"><h2>{t('findJobs.portfolioLinks')}</h2>{profile.portfolio ? <a className="fj-resource-link" href={profile.portfolio} target="_blank" rel="noreferrer"><FiExternalLink /> {t('findJobs.viewPortfolio')}</a> : <span>{t('findJobs.noPortfolio')}</span>}</div></section>
  </article>
}
