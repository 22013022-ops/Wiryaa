import { motion } from 'framer-motion'
import { FaAward, FaLightbulb, FaLock, FaUsers } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import heroBackground from '../assets/images/hero-background.png'
import storyImage from '../assets/images/smart-hiring.png'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import PageEnhancements from '../components/layout/PageEnhancements'

const stats = [
  { value: '500+', label: 'Users supported' },
  { value: '50+', label: 'Projects launched' },
  { value: '99%', label: 'Satisfaction rate' },
]

const values = [
  {
    icon: <FaLightbulb />,
    title: 'Innovation',
    text: 'We continuously improve our platform by blending design, technology, and human insight.',
  },
  {
    icon: <FaLock />,
    title: 'Trust',
    text: 'Security, privacy, and transparency are part of every experience we create.',
  },
  {
    icon: <FaAward />,
    title: 'Quality',
    text: 'Every feature is crafted with care so users can move forward with confidence.',
  },
  {
    icon: <FaUsers />,
    title: 'Community',
    text: 'We believe strong communities grow through meaningful connections and collaboration.',
  },
]

const team = [
  { name: 'Maya Rao', role: 'Founder & Vision Lead', initials: 'MR' },
  { name: 'Nisha Verma', role: 'Product Designer', initials: 'NV' },
  { name: 'Aarav Singh', role: 'Engineering Lead', initials: 'AS' },
]

function AboutPage() {
  return (
    <main className="about-page">
      <Header />

      <section className="about-hero" style={{ backgroundImage: `linear-gradient(120deg, rgba(51,60,55,.84), rgba(106,64,116,.72)), url(${heroBackground})` }}>
        <motion.div className="about-hero-content" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="about-eyebrow">About Us</p>
          <h1>Empowering connections. Creating opportunities.</h1>
          <p>We believe technology should make life easier by bringing people together in one secure, seamless, and inspiring place.</p>
          <div className="about-hero-actions">
            <Link className="hero-action hero-action-outline" to="/">Back to Home</Link>
            <a className="hero-action hero-action-glass" href="#story">Discover Our Story</a>
          </div>
        </motion.div>
      </section>

      <section id="story" className="about-section story-section">
        <motion.div className="about-section-copy" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}>
          <p className="about-eyebrow">Our Story</p>
          <h2>Every great idea starts with a problem.</h2>
          <p>We noticed that many people struggle to find reliable services and trusted opportunities in one place. That is why we created Wiryaa — a simpler, more transparent platform designed to connect people, ideas, and opportunities with confidence.</p>
          <p>What began as a response to everyday friction has grown into a vibrant ecosystem built around trust, creativity, and meaningful progress.</p>
        </motion.div>
        <motion.div className="about-image-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.08 } } }}>
          <img src={storyImage} alt="People collaborating in a modern workspace" />
        </motion.div>
      </section>

      <section className="about-section stats-section">
        <div className="about-section-heading">
          <p className="about-eyebrow">Why it matters</p>
          <h2>A platform built for real-world growth</h2>
        </div>
        <div className="stats-grid">
          {stats.map((item) => (
            <motion.div key={item.label} className="stat-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="about-section mission-grid">
        <motion.article className="info-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.65 }}>
          <p className="about-eyebrow">Our Mission</p>
          <h3>Make everyday experiences simpler through innovation.</h3>
          <p>We aim to create a platform that is easy to use, secure, dependable, and intelligently designed around people’s needs.</p>
        </motion.article>
        <motion.article className="info-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.65, delay: 0.08 }}>
          <p className="about-eyebrow">Our Vision</p>
          <h3>Build a future where technology connects people effortlessly.</h3>
          <p>Our goal is to become a trusted place people return to every day when they need community, opportunity, and progress.</p>
        </motion.article>
      </section>

      <section className="about-section values-section">
        <div className="about-section-heading">
          <p className="about-eyebrow">Our Values</p>
          <h2>The principles behind everything we build</h2>
        </div>
        <div className="values-grid">
          {values.map((value) => (
            <motion.article key={value.title} className="value-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
              <div className="value-icon">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="about-section team-section">
        <div className="about-section-heading">
          <p className="about-eyebrow">Meet Our Team</p>
          <h2>Passionate people creating thoughtful digital experiences</h2>
        </div>
        <div className="team-grid">
          {team.map((member) => (
            <motion.article key={member.name} className="team-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.65 }}>
              <div className="team-avatar">{member.initials}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="about-section cta-section">
        <motion.div className="cta-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }}>
          <p className="about-eyebrow">Join Our Journey</p>
          <h2>We’re excited to have you with us.</h2>
          <p>Whether you’re a newcomer or a returning user, you’re part of the story we’re building together.</p>
          <div className="about-hero-actions">
            <Link className="hero-action hero-action-outline" to="/">Explore the platform</Link>
            <a className="hero-action hero-action-glass" href="#contact">Contact Us</a>
          </div>
        </motion.div>
      </section>

      <Footer />
      <PageEnhancements />
    </main>
  )
}

export default AboutPage
