import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'

function LoginPage() {
  const [values, setValues] = useState({ contact: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const handleChange = ({ target: { name, value } }) => { setValues((current) => ({ ...current, [name]: value })); setSubmitted(false) }
  const handleSubmit = (event) => { event.preventDefault(); const next = {}; if (!values.contact.trim()) next.contact = 'Enter your email address or mobile number.'; if (!values.password) next.password = 'Enter your password.'; setErrors(next); setSubmitted(Object.keys(next).length === 0) }
  return <AuthShell mode="login">
    <div className="auth-card-heading"><p>WELCOME BACK</p><h2 id="auth-title">Log in to Wiryaa</h2><span>New to Wiryaa? <Link to="/signup">Create an account</Link></span></div>
    {submitted && <div className="form-success" role="status">Your login details look good. Login will be connected in a later phase.</div>}
    <form className="auth-form login-form" noValidate onSubmit={handleSubmit}>
      <label className={`form-field ${errors.contact ? 'has-error' : ''}`}><span>Email or mobile number</span><input name="contact" value={values.contact} onChange={handleChange} autoComplete="username" aria-invalid={Boolean(errors.contact)} />{errors.contact && <small className="form-error">{errors.contact}</small>}</label>
      <label className={`form-field ${errors.password ? 'has-error' : ''}`}><span>Password</span><input name="password" type="password" value={values.password} onChange={handleChange} autoComplete="current-password" aria-invalid={Boolean(errors.password)} />{errors.password && <small className="form-error">{errors.password}</small>}</label>
      <button className="auth-submit" type="submit">Log in</button>
    </form>
  </AuthShell>
}

export default LoginPage
