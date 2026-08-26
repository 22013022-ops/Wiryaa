import { Navigate, useLocation } from 'react-router-dom'
import { getSessionUser } from '../../services/authStorage'

function RequireAuth({ children }) {
  const location = useLocation()
  if (!localStorage.getItem('wiryaa-token') || !getSessionUser()) return <Navigate to="/login" replace state={{ destination: location.pathname }} />
  return children
}
export default RequireAuth
