const mongoose = require('mongoose')

const hireTalentsJobPostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true, match: /^$|^\S+@\S+\.\S+$/ },
  phone: { type: String, required: true, trim: true, maxlength: 25 },
  companyName: { type: String, required: true, trim: true, maxlength: 150 },
  jobTitle: { type: String, required: true, trim: true, maxlength: 150 },
  jobTitleEnglish: { type: String, trim: true, maxlength: 150 },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  categoryEnglish: { type: String, trim: true, maxlength: 100 },
  jobType: { type: String, required: true, trim: true, maxlength: 50 },
  jobTypeEnglish: { type: String, trim: true, maxlength: 50 },
  location: { type: String, required: true, trim: true, maxlength: 150 },
  locationEnglish: { type: String, trim: true, maxlength: 150 },
  address: { type: String, trim: true, maxlength: 1000 },
  description: { type: String, required: true, trim: true, maxlength: 10000 },
  descriptionEnglish: { type: String, trim: true, maxlength: 10000 },
  descriptionStructured: [{ description: { type: String, required: true, trim: true, maxlength: 2000 } }],
  experience: { type: String, trim: true, maxlength: 200 },
  salary: { type: String, trim: true, maxlength: 200 },
  benefits: { type: String, trim: true, maxlength: 5000 },
  benefitsEnglish: { type: String, trim: true, maxlength: 5000 },
  benefitsStructured: [{ benefit: { type: String, required: true, trim: true, maxlength: 1000 } }],
  qualifications: { type: String, required: true, trim: true, maxlength: 5000 },
  qualificationsEnglish: { type: String, trim: true, maxlength: 5000 },
}, { collection: 'hire_talents_job_posts', timestamps: true })

module.exports = mongoose.model('HireTalentsJobPost', hireTalentsJobPostSchema)
