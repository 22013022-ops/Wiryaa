const mongoose = require('mongoose')

const assetSchema = new mongoose.Schema({
  secure_url: { type: String, required: true },
  public_id: { type: String, required: true },
  resource_type: { type: String, required: true },
}, { _id: false })

const findJobsProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true, match: /^$|^\S+@\S+\.\S+$/ },
  phone: { type: String, required: true, trim: true, maxlength: 25 },
  age: { type: Number, required: true, min: 16, max: 100 },
  state: { type: String, trim: true, maxlength: 100 },
  city: { type: String, trim: true, maxlength: 100 },
  pincode: { type: String, trim: true, match: /^$|^[0-9]{6}$/ },
  qualification: { type: String, trim: true, maxlength: 250 },
  portfolio: { type: String, trim: true, maxlength: 500 },
  skills: { type: String, trim: true, maxlength: 3000 },
  previousJobs: { type: String, trim: true, maxlength: 5000 },
  roles: { type: String, trim: true, maxlength: 5000 },
  skillsApplied: { type: String, trim: true, maxlength: 3000 },
  certifications: { type: String, trim: true, maxlength: 3000 },
  preferences: { type: String, trim: true, maxlength: 3000 },
  profilePicture: assetSchema,
  resume: assetSchema,
  workSamples: assetSchema,
  certificationAttachments: [assetSchema],
}, { collection: 'find_jobs', timestamps: true })

module.exports = mongoose.model('FindJobsProfile', findJobsProfileSchema)
