import heroBackground from '../../assets/images/hero-background.png'
import { motion } from 'framer-motion'
import { useState } from 'react'

function HeroSection() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  return (
    <section id="home" className="hero-section" style={{ backgroundImage: `url(${heroBackground})` }} onMouseMove={(e) => setOffset({ x: (e.clientX / window.innerWidth - .5) * 12, y: (e.clientY / window.innerHeight - .5) * 12 })}>
      <motion.div className="hero-content" animate={{ x: offset.x, y: offset.y }} transition={{ type: 'spring', stiffness: 45, damping: 18 }}>
        <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>No LIMITS.<br />ENDLESS<br />Opportunities!</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .18 }}>A platform that empowers women to discover careers, connect with employers, and grow their businesses—all in one place.</motion.p>
        <div className="hero-actions">
          <a className="hero-action hero-action-outline" href="#services">Explore Services</a>
          <a className="hero-action hero-action-glass" href="/about">Learn More</a>
        </div>
      </motion.div>
      <a className="scroll-indicator" href="#services" aria-label="Scroll to services"><span /></a>
    </section>
  )
}

export default HeroSection
