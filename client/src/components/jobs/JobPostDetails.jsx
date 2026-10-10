import { FiArrowLeft, FiBriefcase, FiFileText, FiMapPin, FiUsers } from 'react-icons/fi'
import '../../styles/HireTalentsPage.css'

const valueName = (key) => ({ company: 'companyName', title: 'jobTitle', type: 'jobType' }[key] || key)

export default function JobPostDetails({ post, onBack }) {
  const info = (key) => <div className="ht-job-info" key={key}><span>{key}</span><p>{post[valueName(key)] || 'Not provided'}</p></div>
  return <article className="ht-job-page">
    {onBack && <button className="ht-back-button" type="button" onClick={onBack} aria-label="Back to recommendations" title="Back to recommendations"><FiArrowLeft /></button>}
    <div className="ht-page-title"><div><p>Job details</p><h1>{post.jobTitle}</h1><span>Review the complete job post.</span></div></div>
    <nav className="ht-job-nav" aria-label="Job details sections"><a href="#contact">Contact</a><a href="#details">Details</a><a href="#description">Description</a></nav>
    <header className="ht-job-header"><FiBriefcase /><div><p>{post.companyName}</p><h2>{post.jobTitle}</h2><span>{post.jobType} · {post.category}</span></div></header>
    <section className="ht-job-card" id="contact"><h2><FiUsers /> Company contact</h2><div className="ht-job-info-grid">{['name', 'company', 'email', 'phone'].map(info)}</div></section>
    <section className="ht-job-card" id="details"><h2><FiMapPin /> Job details</h2><div className="ht-job-info-grid">{['category', 'type', 'location', 'address', 'experience', 'salary'].map(info)}</div></section>
    <section className="ht-job-card" id="description"><h2><FiFileText /> Description</h2><p>{post.description}</p></section>
    <section className="ht-job-card"><h2>Benefits &amp; qualifications</h2><div className="ht-job-info-grid">{['benefits', 'qualifications'].map(info)}</div></section>
  </article>
}
