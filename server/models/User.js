const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true, unique: true, sparse: true, match: /^\S+@\S+\.\S+$/ },
  mobile: { type: String, trim: true, unique: true, sparse: true, match: /^[0-9+\-()\s]{7,18}$/ },
  password: { type: String, required: true, minlength: 8, select: false },
  gender: { type: String, required: true, enum: ['Female', 'Male'] },
}, { timestamps: true })

userSchema.pre('validate', function validateContact() {
  if (!this.email && !this.mobile) {
    this.invalidate(
      'email',
      'An email address or mobile number is required.'
    )
  }
})

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
