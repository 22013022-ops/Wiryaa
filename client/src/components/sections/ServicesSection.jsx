import careerDiscovery from '../../assets/images/career-discovery.png'
import smartHiring from '../../assets/images/smart-hiring.png'
import marketplace from '../../assets/images/marketplace.png'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSessionUser } from '../../services/authStorage'
import { useTranslation } from 'react-i18next'

const services = [
  {
    eyebrow: 'services.career', title: 'services.find', description: 'services.findText', action: 'services.start',
    image: careerDiscovery,
    imageAlt: 'Woman working at a laptop',
    tone: 'cream',
  },
  {
    eyebrow: 'services.smart', title: 'services.hire', description: 'services.hireText', action: 'services.hire',
    image: smartHiring,
    imageAlt: 'Women collaborating in an office',
    tone: 'lilac',
    reversed: true,
  },
  {
    eyebrow: 'marketplace.eyebrow',
    title: 'marketplace.title',
    description: 'marketplace.description',
    action: 'marketplace.action',
    image: marketplace,
    imageAlt: 'marketplace.imageAlt',
    tone: 'cream',
  },
]

function ServiceCard({ service }) {
  const { t } = useTranslation()
  const [loaded, setLoaded] = useState(false)
  const isSignedIn = Boolean(getSessionUser())
  const isFindJobs = service.title === 'services.find'
  const serviceDestination = isFindJobs ? '/find-jobs' : '/hire-talents'
  return (
    <motion.article initial="hidden" whileInView="visible" viewport={{ once: true, amount: .12, margin: '0px 0px -8% 0px' }} className={`service-card ${service.tone} ${service.reversed ? 'reversed' : ''}`}>
      <div className="service-card-inner">
        <motion.div className="service-image-wrap" variants={{ hidden: { opacity: 0, y: 42 }, visible: { opacity: 1, y: 0, transition: { duration: .9, ease: [0.16, 1, 0.3, 1] } } }}>
          <img className={loaded ? 'loaded' : ''} loading="lazy" src={service.image} alt={t(service.imageAlt)} onLoad={() => setLoaded(true)} />
        </motion.div>
        <motion.div className="service-copy" variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: .82, delay: .16, ease: [0.16, 1, 0.3, 1] } } }}>
          <div>
            <p className="service-eyebrow">{t(service.eyebrow)}</p><h3>{t(service.title)}</h3><p className="service-description">{t(service.description)}</p>
          </div>
          {isFindJobs || service.title === 'services.hire' ? (
            <Link className="service-action" to={isSignedIn ? serviceDestination : '/signup'} state={isSignedIn ? undefined : { destination: serviceDestination }}>{t(service.action)}</Link>
          ) : (
            <a className="service-action" href="#signup">{t(service.action)}</a>
          )}
        </motion.div>
      </div>
    </motion.article>
  )
}

function ServicesSection() {
  const { t } = useTranslation()
  return (
    <section id="services" className="services-section">
      <div className="services-heading">
        <p>{t('services.eyebrow')}</p><h2>{t('services.title')}</h2><span>{t('services.text')}</span>
      </div>
      <div className="service-list">
        {services.map((service) => <ServiceCard key={service.title} service={service} />)}
      </div>
    </section>
  )
}

export default ServicesSection
