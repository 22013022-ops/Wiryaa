import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import LanguagePage from './pages/LanguagePage'
import FindJobsPage from './pages/FindJobsPage'
import HireTalentsPage from './pages/HireTalentsPage'
import ProfilePage from './pages/ProfilePage'
import RequireAuth from './components/auth/RequireAuth'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/language" element={<RequireAuth><LanguagePage /></RequireAuth>} />
        <Route path="/find-jobs" element={<RequireAuth><FindJobsPage /></RequireAuth>} />
        <Route path="/hire-talents" element={<RequireAuth><HireTalentsPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
