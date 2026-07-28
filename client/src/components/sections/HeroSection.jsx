import heroBackground from '../../assets/images/hero-background.png'

function HeroSection() {
  return (
    <section id="home" className="hero-section" style={{ backgroundImage: `url(${heroBackground})` }}>
      <div className="hero-content">
        <h1>No LIMITS.<br />ENDLESS<br />Opportunities!</h1>
        <p>A platform that empowers women to discover careers, connect with employers, and grow their businesses—all in one place.</p>
        <div className="hero-actions">
          <a className="hero-action hero-action-outline" href="#services">Explore Services</a>
          <a className="hero-action hero-action-glass" href="#about">Learn More</a>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
