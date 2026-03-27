import { Suspense, lazy, memo, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { PageSkeleton, PageLoader, TopProgressBar } from './components/common'

const AppLayout       = lazy(() => import('./layouts/AppLayout'))
const Dashboard       = lazy(() => import('./pages/Dashboard'))
const DailyTasks      = lazy(() => import('./pages/DailyTasks'))
const Goals           = lazy(() => import('./pages/Goals'))
const Habits          = lazy(() => import('./pages/Habits'))
const Notes           = lazy(() => import('./pages/Notes'))
const Reports         = lazy(() => import('./pages/Reports'))
const Profile         = lazy(() => import('./pages/Profile'))
const SEHub           = lazy(() => import('./pages/SEHub'))
const VUCourses       = lazy(() => import('./pages/VUCourses'))
const NamazTracker    = lazy(() => import('./pages/NamazTracker'))
const Passwords       = lazy(() => import('./pages/Passwords'))
const Records         = lazy(() => import('./pages/Records'))
const Diary           = lazy(() => import('./pages/Diary'))
const Accounts        = lazy(() => import('./pages/Accounts'))
const Login           = lazy(() => import('./pages/Login'))
const Register        = lazy(() => import('./pages/Register'))
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword   = lazy(() => import('./pages/ResetPassword'))

const toasterOptions = {
  style: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: '13px',
    background: 'rgba(255,255,255,0.97)',
    color: '#1a1512',
    border: '1px solid #e2d9c8',
    boxShadow: '0 8px 32px rgba(40,28,12,0.12)',
    borderRadius: '14px',
    backdropFilter: 'blur(12px)',
    padding: '12px 16px',
  },
  success: { iconTheme: { primary: '#1f5c42', secondary: '#fff' } },
  error:   { iconTheme: { primary: '#b83225', secondary: '#fff' } },
}

const PrivateRoute = memo(function PrivateRoute({ children }) {
  const { token } = useSelector(s => s.auth)
  return token ? children : <Navigate to="/login" replace />
})

const PublicRoute = memo(function PublicRoute({ children }) {
  const { token } = useSelector(s => s.auth)
  return !token ? children : <Navigate to="/" replace />
})

// Show brand loader on very first mount for 1.4s
function AppBoot({ children }) {
  const [booting, setBooting] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1400)
    return () => clearTimeout(t)
  }, [])
  if (booting) return <PageLoader />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AppBoot>
        <TopProgressBar />
        <Toaster position="top-right" toastOptions={toasterOptions} />
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/login"                element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register"             element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password"      element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route index                      element={<Dashboard />} />
              <Route path="daily-tasks"         element={<DailyTasks />} />
              <Route path="goals"               element={<Goals />} />
              <Route path="habits"              element={<Habits />} />
              <Route path="notes"               element={<Notes />} />
              <Route path="reports"             element={<Reports />} />
              <Route path="se-hub"              element={<SEHub />} />
              <Route path="vu-courses"          element={<VUCourses />} />
              <Route path="namaz-tracker"       element={<NamazTracker />} />
              <Route path="passwords"           element={<Passwords />} />
              <Route path="accounts"            element={<Accounts />} />
              <Route path="records"             element={<Records />} />
              <Route path="diary"               element={<Diary />} />
              <Route path="profile"             element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppBoot>
    </BrowserRouter>
  )
}
