const AppError = require('../utils/AppError')

const supportedLanguages = new Set(['en', 'hi', 'mr'])
let translatorPromise

function normalizeLanguage(language) {
  const normalized = String(language || 'en').toLowerCase().split('-')[0]
  return supportedLanguages.has(normalized) ? normalized : 'en'
}

async function getTranslator() {
  if (!translatorPromise) {
    translatorPromise = import('translate').then(({ default: translate }) => {
      translate.engine = 'google'
      return translate
    })
  }
  return translatorPromise
}

async function translateText(text, { from = 'en', to = 'en' } = {}) {
  const value = String(text || '')
  const sourceLanguage = normalizeLanguage(from)
  const targetLanguage = normalizeLanguage(to)
  if (!value.trim() || sourceLanguage === targetLanguage) return value

  try {
    const translate = await getTranslator()
    return await translate(value, { from: sourceLanguage, to: targetLanguage })
  } catch (error) {
    throw new AppError('Unable to translate the submitted text.', 502)
  }
}

function translateToEnglish(text, sourceLanguage) {
  // Latin-script input is already treated as English. This prevents an English
  // value from being misidentified when a user has selected Hindi or Marathi.
  const detectedSourceLanguage = /[\u0900-\u097F]/.test(String(text || '')) ? sourceLanguage : 'en'
  return translateText(text, { from: detectedSourceLanguage, to: 'en' })
}

function translateFromEnglish(text, viewerLanguage) {
  return translateText(text, { from: 'en', to: viewerLanguage })
}

module.exports = { normalizeLanguage, translateToEnglish, translateFromEnglish }
