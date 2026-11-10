import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const AdminDashboard = lazy(() => import('./AdminDashboard.tsx'))

const isAdminPage = window.location.pathname.replace(/\/+$/, '') === '/admin'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminPage ? (
      <Suspense fallback={<main className="admin-page"><p>Memuat dashboard…</p></main>}>
        <AdminDashboard />
      </Suspense>
    ) : <App />}
  </StrictMode>,
)
