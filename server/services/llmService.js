const AppError = require('../utils/AppError')

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'minimax/minimax-m2.7:free'

function buildPrompt(text, outputType) {
  let prompt

  if (outputType === 'skills') {
    prompt = `
You are a highly specialized system for extracting professional skills.

Analyze the user's conversational text and extract all skills they explicitly
mention or clearly demonstrate.

Convert each skill into a standard, professional, Title Case job-skill noun.
Do not return verbs, adjectives, or casual wording.

Do not invent skills or infer skills that are not clearly supported by the text.

Text: "${text}"

Return plain text strictly in this format:

skills:
- skill_name: "<skill1>"
- skill_name: "<skill2>"

Example:
Text: "I can do tailoring and cooking"
skills:
- skill_name: "Tailoring"
- skill_name: "Cooking"

Example:
Text: "I'm really good at doing the bills and keeping track of all the money
for my household, plus I can quickly fix small scratches on wooden furniture,
and I've been running the family's social media pages since last year."
skills:
- skill_name: "Bookkeeping / Personal Finance Management"
- skill_name: "Basic Carpentry / Furniture Restoration"
- skill_name: "Social Media Management"
`

  } else if (outputType === 'constraints') {
    prompt = `
You are an expert system for extracting and normalizing work constraints.

Analyze the user's text and extract constraints related to:
- work availability
- working hours or shifts
- location
- days of availability
- childcare or other responsibilities affecting work
- transportation or travel limitations
- other conditions that affect the type of work the user can accept
- any other work-related constraint explicitly mentioned in the user's text

Rewrite each constraint in clear, formal, professional language suitable for
semantic matching.

Most importantly, preserve the exact meaning of the user's statement.
Do not infer, assume, add, or reverse information.

Carefully distinguish between:
- can / cannot
- available / unavailable
- prefers / does not prefer
- wants / does not want

Text: "${text}"

Return plain text strictly in this format:

constraints:
- constraint_text: "<constraint1>"
- constraint_text: "<constraint2>"

Example:
Text: "I have two kids, so I need to be home by 6 in the evening and I can't travel
too far for work."
constraints:
- constraint_text: "Must be available to return home by 6 PM due to childcare responsibilities"
- constraint_text: "Limited ability to travel long distances for work"

Example:
Text: "I don't have my own vehicle, so I would prefer something I can reach by bus
or train."
constraints:
- constraint_text: "Prefers job locations accessible by public transportation"

Example:
Text: "I may need to take a half-day leave on Tuesdays and Thursdays because I
need to accompany my grandfather to his dialysis appointments."
constraints:
- constraint_text: "May require half-day leave on Tuesdays and Thursdays due to family caregiving responsibilities"

Example:
Text: "I am comfortable working from home, but I can also come to the office if
it's nearby."
constraints:
- constraint_text: "Prefers remote work"
- constraint_text: "Can work from an office if the location is nearby"

Example:
Text: "I need flexible timings because I have household responsibilities."
constraints:
- constraint_text: "Requires flexible working hours due to household responsibilities"

Example:
Text: "I don't want a job that requires frequent travel."
constraints:
- constraint_text: "Does not prefer jobs requiring frequent travel"

Example:
Text: "I can work at night and I am okay with relocating outside Pune."
constraints:
- constraint_text: "Available for night shift work"
- constraint_text: "Willing to relocate outside Pune"
`

  } else if (outputType === 'description') {
    prompt = `
You are an expert system for extracting and normalizing job requirements
and responsibilities from job descriptions.

Extract only requirements, responsibilities, skills, and job duties explicitly
mentioned in the text.

Rewrite them in clear, standardized, professional language suitable for
semantic matching.

Do not invent or infer requirements that are not present in the text.

Text: "${text}"

Return plain text strictly in this format:

descriptions:
- description: "<description1>"
- description: "<description2>"

Example:
Text: "We need a developer who can work with Python, manage databases,
and lead a team"
descriptions:
- description: "Python development"
- description: "Database management"
- description: "Team leadership"

Example:
Text: "We need someone to look after the shop, handle customers, keep track of stock, and manage the daily sales."
descriptions:
- description: "Retail Store Management"
- description: "Customer Service"
- description: "Inventory Management"
- description: "Sales Management"

Example:
Text: "We need someone to clean the house, wash clothes, and help with basic household chores."
descriptions:
- description: "Housekeeping"
- description: "Laundry"
- description: "General household assistance"
`

  } else if (outputType === 'benefits') {
    prompt = `
You are an expert system for extracting and normalizing employee benefits
and perks from job postings.

Extract only benefits explicitly mentioned in the text, including:
- health insurance
- retirement benefits
- paid leave
- flexible work arrangements
- transportation benefits
- other employee benefits or perks

Rewrite them in clear, standardized, professional language suitable for
semantic matching.

Do not invent or infer benefits that are not present in the text.

Text: "${text}"

Return plain text strictly in this format:

benefits:
- benefit: "<benefit1>"
- benefit: "<benefit2>"

Example:
Text: "We offer health insurance, 401k matching, work from home flexibility,
and 4 weeks PTO"

benefits:
- benefit: "Health insurance"
- benefit: "401k matching"
- benefit: "Work from home flexibility"
- benefit: "4 weeks paid time off"
`
  } else {
    throw new AppError(`Unsupported LLM output type: ${outputType}.`, 400)
  }

  return prompt
}

function parseStructuredOutput(plainText, outputType) {
  const fieldByOutputType = {
    skills: 'skill_name',
    constraints: 'constraint_text',
    description: 'description',
    benefits: 'benefit',
  }
  const headingByOutputType = {
    skills: 'skills:',
    constraints: 'constraints:',
    description: 'descriptions:',
    benefits: 'benefits:',
  }
  const field = fieldByOutputType[outputType]
  const expectedHeading = headingByOutputType[outputType]
  if (!field || !expectedHeading || !plainText.split(/\r?\n/).some((line) => line.trim().toLowerCase() === expectedHeading)) {
    throw new AppError(`The LLM returned an invalid ${outputType} format.`, 502)
  }
  const itemPattern = new RegExp(`^\\s*-\\s*${field}\\s*:\\s*[\"']?(.*?)[\"']?\\s*$`, 'i')
  const items = plainText
    .split(/\r?\n/)
    .map((line) => line.match(itemPattern))
    .filter(Boolean)
    .map((match) => match[1].trim())
    .filter(Boolean)

  if (!items.length) throw new AppError(`The LLM returned an invalid ${outputType} format.`, 502)

  return items.map((value) => ({ [field]: value }))
}

async function structureText(text, outputType) {
  if (!String(text || '').trim()) return []
  if (!process.env.OPENROUTER_API_KEY) throw new AppError('OPENROUTER_API_KEY is not configured.', 500)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: buildPrompt(text, outputType) }],
      }),
      signal: controller.signal,
    })
    const body = await response.json().catch(() => null)

    if (!response.ok) throw new AppError(body?.error?.message || 'The LLM request failed.', 502)
    const plainText = body?.choices?.[0]?.message?.content
    console.log('LLM outputType:', outputType)
    console.log('LLM full response:', JSON.stringify(body, null, 2))
    console.log('LLM plainText:', plainText)
    if (typeof plainText !== 'string') throw new AppError('The LLM returned no text content.', 502)
    return parseStructuredOutput(plainText, outputType)
  } catch (error) {
    if (error.isOperational) throw error
    if (error.name === 'AbortError') throw new AppError('The LLM request timed out.', 504)
    throw new AppError('Unable to reach the LLM service.', 502)
  } finally {
    clearTimeout(timeout)
  }
}

module.exports = { structureText, parseStructuredOutput }
