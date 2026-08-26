import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'

const initialValues = { fullName: '', email: '', mobile: '', password: '', confirmPassword: '', gender: '' }

function SignupPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const next = {}
    if (!values.fullName.trim()) next.fullName = 'Please enter your full name.'
    if (!values.email.trim() && !values.mobile.trim()) next.contact = 'Enter an email address or mobile number.'
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) next.email = 'Enter a valid email address.'
    if (values.mobile && !/^[0-9+\-()\s]{7,18}$/.test(values.mobile)) next.mobile = 'Enter a valid mobile number.'
    if (!values.password) next.password = 'Please create a password.'
    else if (values.password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (!values.confirmPassword) next.confirmPassword = 'Please confirm your password.'
    else if (values.password !== values.confirmPassword) next.confirmPassword = 'Passwords do not match.'
    if (!values.gender) next.gender = 'Please select your gender.'
    return next
  }

  const handleChange = ({ target: { name, value } }) => {
    setValues((current) => ({ ...current, [name]: value }))
    setSubmitted(false)
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    setSubmitted(Object.keys(next).length === 0)
  }

  return <AuthShell mode="signup">
    <div className="auth-card-heading"><p>CREATE YOUR ACCOUNT</p><h2 id="auth-title">Join Wiryaa</h2><span>Already have an account? <Link to="/login">Log in</Link></span></div>
    {submitted && <div className="form-success" role="status">Your account details look good. Signup will be connected in a later phase.</div>}
    <form className="auth-form" noValidate onSubmit={handleSubmit}>
      <Field label="Full name" name="fullName" value={values.fullName} error={errors.fullName} onChange={handleChange} autoComplete="name" />
      <div className="auth-contact-label">Contact details <span>Use either one</span></div>
      {errors.contact && <p className="form-error contact-error">{errors.contact}</p>}
      <div className="auth-form-grid">
        <Field label="Email address" name="email" type="email" value={values.email} error={errors.email} onChange={handleChange} autoComplete="email" />
        <Field label="Mobile number" name="mobile" type="tel" value={values.mobile} error={errors.mobile} onChange={handleChange} autoComplete="tel" />
      </div>
      <div className="auth-form-grid">
        <Field label="Password" name="password" type="password" value={values.password} error={errors.password} onChange={handleChange} autoComplete="new-password" />
        <Field label="Confirm password" name="confirmPassword" type="password" value={values.confirmPassword} error={errors.confirmPassword} onChange={handleChange} autoComplete="new-password" />
      </div>
      <fieldset className={`gender-field ${errors.gender ? 'has-error' : ''}`}><legend>Gender</legend><div className="gender-options"><label><input type="radio" name="gender" value="Female" checked={values.gender === 'Female'} onChange={handleChange} /> <span>Female</span></label><label><input type="radio" name="gender" value="Male" checked={values.gender === 'Male'} onChange={handleChange} /> <span>Male</span></label></div>{errors.gender && <p className="form-error">{errors.gender}</p>}</fieldset>
      <button className="auth-submit" type="submit">Create account</button>
    </form>
  </AuthShell>
}

function Field({ label, name, type = 'text', value, error, onChange, autoComplete }) {
  return <label className={`form-field ${error ? 'has-error' : ''}`}><span>{label}</span><input name={name} type={type} value={value} onChange={onChange} autoComplete={autoComplete} aria-invalid={Boolean(error)} />{error && <small className="form-error">{error}</small>}</label>
}

export default SignupPage
