import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../state/AuthContext'

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  // Already signed in (including admins) -> go straight to the workspace.
  if (user) return <Navigate to="/dashboard" replace />

  return children
}
