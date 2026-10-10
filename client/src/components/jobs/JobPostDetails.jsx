import { FiArrowLeft, FiBriefcase, FiFileText, FiMapPin, FiUsers } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import '../../styles/HireTalentsPage.css'

const valueName = (key) => ({ company: 'companyName', title: 'jobTitle', type: 'jobType' }[key] || key)

export default function JobPostDetails({ post, onBack }) {
  const { t } = useTranslation()
  const info = (key) => <div className="ht-job-info" key={key}><span>{t(`hireTalents.${key}`)}</span><p>{post[valueName(key)] || t('hireTalents.notAdded')}</p></div>
  return <article className="ht-job-page">
    {onBack && <button className="ht-back-button" type="button" onClick={onBack} aria-label={t('common.backToRecommendations')} title={t('common.backToRecommendations')}><FiArrowLeft /></button>}
    <div className="ht-page-title"><div><p>{t('hireTalents.jobPost')}</p><h1>{post.jobTitle}</h1><span>{t('hireTalents.recommendationDetailIntro')}</span></div></div>
    <nav className="ht-job-nav" aria-label={t('hireTalents.sections')}><a href="#contact">{t('common.contact')}</a><a href="#details">{t('hireTalents.details')}</a><a href="#description">{t('hireTalents.description')}</a></nav>
    <header className="ht-job-header"><FiBriefcase /><div><p>{post.companyName}</p><h2>{post.jobTitle}</h2><span>{post.jobType} · {post.category}</span></div></header>
    <section className="ht-job-card" id="contact"><h2><FiUsers /> {t('hireTalents.companyContact')}</h2><div className="ht-job-info-grid">{['name', 'company', 'email', 'phone'].map(info)}</div></section>
    <section className="ht-job-card" id="details"><h2><FiMapPin /> {t('hireTalents.details')}</h2><div className="ht-job-info-grid">{['category', 'type', 'location', 'address', 'experience', 'salary'].map(info)}</div></section>
    <section className="ht-job-card" id="description"><h2><FiFileText /> {t('hireTalents.description')}</h2><p>{post.description}</p></section>
    <section className="ht-job-card"><h2>{t('hireTalents.benefits')} &amp; {t('hireTalents.qualifications')}</h2><div className="ht-job-info-grid">{['benefits', 'qualifications'].map(info)}</div></section>
  </article>
}
