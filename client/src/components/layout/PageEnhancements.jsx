import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
function PageEnhancements() { const { t } = useTranslation(); const [progress, setProgress] = useState(0); useEffect(() => { const update = () => setProgress(window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) * 100); update(); addEventListener('scroll', update, { passive: true }); return () => removeEventListener('scroll', update) }, []); return <><div className="scroll-progress" style={{ transform: `scaleX(${progress / 100})` }} /><button className="back-to-top" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })} aria-label={t('accessibility.backTop')}>↑</button></> }
export default PageEnhancements
