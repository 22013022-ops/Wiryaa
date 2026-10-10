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
  const sourceLanguage = from === 'auto' ? 'auto' : normalizeLanguage(from)
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

function translateForViewer(text, viewerLanguage) {
  const value = String(text || '')
  const targetLanguage = normalizeLanguage(viewerLanguage)
  if (!value.trim()) return Promise.resolve(value)

  return fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(value)}`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Translation provider returned ${response.status}.`)
      const payload = await response.json()
      const translated = payload?.[0]?.map((part) => part[0]).join('')
      if (!translated) throw new Error('Translation provider returned no translated text.')
      return translated
    })
    .catch(() => { throw new AppError('Unable to translate the submitted text.', 502) })
}

async function translateFieldsForViewer(record, fields, viewerLanguage) {
  if (!record) return record
  const failedFields = []
  const translated = await Promise.all(fields.map(async (field) => {
    try {
      return [field, await translateForViewer(record[field], viewerLanguage)]
    } catch (_) {
      failedFields.push(field)
      return [field, record[field]]
    }
  }))
  if (failedFields.length) console.warn(`Content translation fell back to original text for fields: ${failedFields.join(', ')}`)
  return { ...record, ...Object.fromEntries(translated) }
}

module.exports = { normalizeLanguage, translateToEnglish, translateFromEnglish, translateForViewer, translateFieldsForViewer }
