import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import DailyTasks from './pages/DailyTasks'
import Goals from './pages/Goals'
import Habits from './pages/Habits'
import Notes from './pages/Notes'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import SEHub from './pages/SEHub'
import VUCourses from './pages/VUCourses'
import NamazTracker from './pages/NamazTracker'
import Passwords from './pages/Passwords'
import Records from './pages/Records'
import Diary from './pages/Diary'
import Accounts from './pages/Accounts'
import Login from './pages/Login'
import Register from './pages/Register'

function PrivateRoute({ children }) {
  const { token } = useSelector(s => s.auth)
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token } = useSelector(s => s.auth)
  return !token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '14px',
            background: '#fff',
            color: '#1A1714',
            border: '1px solid #E8E4DC',
            boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#2D6A4F', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="daily-tasks" element={<DailyTasks />} />
          <Route path="goals" element={<Goals />} />
          <Route path="habits" element={<Habits />} />
          <Route path="notes" element={<Notes />} />
          <Route path="reports" element={<Reports />} />
          <Route path="se-hub" element={<SEHub />} />
          <Route path="vu-courses" element={<VUCourses />} />
          <Route path="namaz-tracker" element={<NamazTracker />} />
          <Route path="passwords" element={<Passwords />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="records" element={<Records />} />
          <Route path="diary" element={<Diary />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
