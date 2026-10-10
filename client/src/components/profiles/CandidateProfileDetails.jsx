import { FiArrowLeft, FiAward, FiExternalLink, FiFileText, FiMapPin, FiPhone, FiUser } from 'react-icons/fi'
import '../../styles/FindJobsPage.css'

export default function CandidateProfileDetails({ profile, onBack, workspaceLabel = 'Candidate profile', title = profile.name, subtitle = 'Review the candidate’s experience, skills and work samples.' }) {
  const location = [profile.city, profile.state].filter(Boolean).join(', ') || 'Location not added'
  const samples = Array.isArray(profile.workSamples) ? profile.workSamples : profile.workSamples ? [profile.workSamples] : []
  const assets = (items = []) => <div className="fj-asset-gallery">{items.map((asset) => asset.resource_type === 'image'
    ? <a key={asset.public_id} className="fj-image-asset" href={asset.secure_url} target="_blank" rel="noreferrer"><img src={asset.secure_url} alt="Candidate work sample" /></a>
    : asset.resource_type === 'video' ? <video key={asset.public_id} className="fj-video-asset" controls preload="metadata"><source src={asset.secure_url} /></video>
      : <a key={asset.public_id} className="fj-document-asset" href={asset.secure_url} target="_blank" rel="noreferrer"><FiFileText /><span>Open attachment</span><FiExternalLink /></a>)}</div>
  return <article className="fj-profile-page">
    {onBack && <button className="fj-back-button" type="button" onClick={onBack} aria-label="Back to recommendations" title="Back to recommendations"><FiArrowLeft /></button>}
    <div className="fj-page-title"><div><p>{workspaceLabel}</p><h1>{title}</h1><span>{subtitle}</span></div></div>
    <header className="fj-profile-header"><div className="fj-profile-photo">{profile.profilePicture?.secure_url ? <img src={profile.profilePicture.secure_url} alt={`${profile.name}'s profile`} /> : <FiUser />}</div><div className="fj-profile-title"><h2>{profile.name}</h2><span>{profile.age ? `${profile.age} years old` : ''}</span><div className="fj-profile-contact">{profile.email && <span>{profile.email}</span>}{profile.phone && <a href={`tel:${profile.phone}`}><FiPhone /> {profile.phone}</a>}<span><FiMapPin /> {location}</span></div></div></header>
    <section className="fj-profile-card"><h2>About</h2><p>{profile.preferences || 'No preferences added.'}</p></section>
    <section className="fj-profile-card"><h2>Skills</h2><p>{profile.skills || 'No skills added.'}</p></section>
    <section className="fj-profile-card"><h2>Experience &amp; education</h2><div className="fj-profile-details"><div><span>Qualification</span><p>{profile.qualification || 'Not added'}</p></div><div><span>Previous jobs</span><p>{profile.previousJobs || 'Not added'}</p></div><div><span>Roles &amp; responsibilities</span><p>{profile.roles || 'Not added'}</p></div><div><span>Skills applied</span><p>{profile.skillsApplied || 'Not added'}</p></div></div></section>
    <section className="fj-profile-card"><h2><FiAward /> Certifications &amp; achievements</h2><p>{profile.certifications || 'Not added'}</p>{assets(profile.certificationAttachments)}</section>
    <section className="fj-profile-card"><h2>Work samples</h2>{samples.length ? assets(samples) : <p>No work samples added.</p>}</section>
    <section className="fj-profile-card fj-profile-resources"><div><h2>Resume</h2>{profile.resume ? <a className="fj-resource-link" href={profile.resume.secure_url} target="_blank" rel="noreferrer"><FiFileText /> View resume <FiExternalLink /></a> : <span>No resume added.</span>}</div><div className="fj-portfolio-resource"><h2>Portfolio</h2>{profile.portfolio ? <a className="fj-resource-link" href={profile.portfolio} target="_blank" rel="noreferrer"><FiExternalLink /> View portfolio</a> : <span>No portfolio added.</span>}</div></section>
  </article>
}
