import Header from '../components/layout/Header'
import HeroSection from '../components/sections/HeroSection'
import ServicesSection from '../components/sections/ServicesSection'
import Footer from '../components/layout/Footer'
import PageEnhancements from '../components/layout/PageEnhancements'

function LandingPage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <ServicesSection />
      <section id="about" className="about-anchor" aria-label="About Wiryaa" />
      <Footer />
      <PageEnhancements />
    </main>
  )
}

export default LandingPage
