import careerDiscovery from '../../assets/images/career-discovery.png'
import smartHiring from '../../assets/images/smart-hiring.png'
import marketplace from '../../assets/images/marketplace.png'

const services = [
  {
    eyebrow: 'Career Discovery',
    title: 'Find Jobs',
    description: 'Our AI engine reads your profile, skills, and aspirations to surface roles perfectly matched to you. Salary benchmarks, insider tips, and career clarity — all at your fingertips.',
    action: 'Start Your Journey',
    image: careerDiscovery,
    imageAlt: 'Woman working at a laptop',
    tone: 'cream',
  },
  {
    eyebrow: 'Smart Hiring',
    title: 'Hire Talents',
    description: "Stop sifting through hundreds of CVs. Wiryaa's AI ranks women candidates by fit, culture-match, and skill depth — so you connect with the right person faster, with less bias.",
    action: 'Post a Role',
    image: smartHiring,
    imageAlt: 'Women collaborating in an office',
    tone: 'lilac',
    reversed: true,
  },
  {
    eyebrow: "Women's Marketplace",
    title: "Women's Marketplace",
    description: 'Home bakeries, tailoring studios, beauty services, tuition classes, handicrafts, homemade food — list your business in minutes. Customers discover, browse, and connect directly.',
    action: 'Post your Business',
    image: marketplace,
    imageAlt: 'Woman crafting a product',
    tone: 'cream',
  },
]

function ServiceCard({ service }) {
  return (
    <article className={`service-card ${service.tone} ${service.reversed ? 'reversed' : ''}`}>
      <div className="service-card-inner">
        <div className="service-image-wrap">
          <img src={service.image} alt={service.imageAlt} />
        </div>
        <div className="service-copy">
          <div>
            <p className="service-eyebrow">{service.eyebrow}</p>
            <h3>{service.title}</h3>
            <p className="service-description">{service.description}</p>
          </div>
          <a className="service-action" href="#signup">{service.action}</a>
        </div>
      </div>
    </article>
  )
}

function ServicesSection() {
  return (
    <section id="services" className="services-section">
      <div className="services-heading">
        <p>What we offer</p>
        <h2>Three Ways To Move Forward</h2>
        <span>Whether you're searching, hiring, or building — Wiryaa's meets you exactly where you are.</span>
      </div>
      <div className="service-list">
        {services.map((service) => <ServiceCard key={service.title} service={service} />)}
      </div>
    </section>
  )
}

export default ServicesSection
