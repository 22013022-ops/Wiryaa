import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import AuthShell from '../components/auth/AuthShell'
import api from '../services/api'
import { saveSession } from '../services/authStorage'

function LoginPage() {
  const [values, setValues] = useState({ contact: '', password: '' }); const [errors, setErrors] = useState({}); const [formError, setFormError] = useState(''); const [loading, setLoading] = useState(false); const [passwordVisible, setPasswordVisible] = useState(false); const location = useLocation(); const navigate = useNavigate()
  const change = ({ target }) => { setValues((current) => ({ ...current, [target.name]: target.value })); setFormError('') }
  const submit = async (event) => { event.preventDefault(); const next = {}; if (!values.contact.trim()) next.contact = 'Enter your email address or mobile number.'; if (!values.password) next.password = 'Enter your password.'; setErrors(next); if (Object.keys(next).length) return; setLoading(true); try { const { data } = await api.post('/auth/login', values); saveSession(data.data); navigate('/language', { replace: true, state: { destination: location.state?.destination || '/' } }) } catch (error) { setFormError(error.response?.data?.message || 'Unable to log in. Please try again.') } finally { setLoading(false) } }
  return <AuthShell mode="login"><div className="auth-card-heading"><p>WELCOME BACK</p><h2 id="auth-title">Log in to Wiryaa</h2><span>New to Wiryaa? <Link to="/signup" state={location.state}>Create an account</Link></span></div>{formError && <div className="form-api-error" role="alert">{formError}</div>}<form className="auth-form login-form" noValidate onSubmit={submit}><label className={`form-field ${errors.contact ? 'has-error' : ''}`}><span>Email or mobile number</span><input name="contact" value={values.contact} onChange={change} autoComplete="username" />{errors.contact && <small className="form-error">{errors.contact}</small>}</label><label className={`form-field ${errors.password ? 'has-error' : ''}`}><span>Password</span><span className="password-input-wrap"><input name="password" type={passwordVisible ? 'text' : 'password'} value={values.password} onChange={change} autoComplete="current-password" /><button className="password-toggle" type="button" onClick={() => setPasswordVisible((current) => !current)} aria-label={`${passwordVisible ? 'Hide' : 'Show'} password`}>{passwordVisible ? <FiEyeOff /> : <FiEye />}</button></span>{errors.password && <small className="form-error">{errors.password}</small>}</label><button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button></form></AuthShell>
}
export default LoginPage
