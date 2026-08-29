import { useEffect, useRef, useState } from 'react'
import { FiMic } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const speechLanguages = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' }

function VoiceInputButton({ onTranscript, className = '' }) {
  const { t, i18n } = useTranslation()
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')
  const supported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => () => recognitionRef.current?.stop(), [])

  const startRecognition = () => {
    if (!supported || isListening) return
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new Recognition()
    const language = String(i18n.resolvedLanguage || i18n.language || 'en').split('-')[0]
    recognition.lang = speechLanguages[language] || speechLanguages.en
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => onTranscript?.(event.results[0][0].transcript.trim())
    recognition.onerror = (event) => setError(t(event.error === 'not-allowed' ? 'accessibility.microphoneDenied' : 'accessibility.voiceFailed'))
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    setError('')
    setIsListening(true)
    recognition.start()
  }

  return <span className={`voice-input-control ${className}`}><button type="button" onClick={startRecognition} disabled={!supported || isListening} aria-label={t(isListening ? 'accessibility.listening' : 'accessibility.voiceInput')} title={t(supported ? 'accessibility.voiceInput' : 'accessibility.unsupportedVoice')}><FiMic aria-hidden="true" /> <span>{t(isListening ? 'accessibility.listeningText' : 'accessibility.speak')}</span></button>{error && <small role="status">{error}</small>}</span>
}

export default VoiceInputButton
