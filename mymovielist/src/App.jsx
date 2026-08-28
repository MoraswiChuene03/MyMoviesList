import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient' 
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import MovieDetails from './pages/MovieDetails'
import tmdbLogo from './assets/tmdb-logo.svg'

function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Load the current authenticated user when the app mounts.
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user)
    })

    // Subscribe to auth state changes so the UI updates immediately on sign in/out.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else if (_event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => data?.subscription?.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#141414', color: 'white', fontFamily: 'sans-serif' }}>
      {/* Navigation Bar */}
      <nav style={{ padding: '20px', backgroundColor: '#090909', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#00d2ff' }}>MyMovieList</span>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>

        {user && <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</Link>}

        {user ? (
          <button
            onClick={handleLogout}
            style={{ backgroundColor: '#ff5555', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
          >Log Out</button>
        ) : (
          <Link
            to="/login"
            style={{ backgroundColor: '#00d2ff', color: '#090909', padding: '8px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
          >Log In</Link>
        )}
      </nav>

      {/* Page Switcher */}
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#090909', padding: '20px', textAlign: 'center', marginTop: '40px' }}>
        <img
          src={tmdbLogo}
          alt="TMDb Logo"
          style={{ width: '120px', height: 'auto', marginBottom: '10px' }}
        />
        <p style={{ color: '#aaa', fontSize: '14px' }}>This product uses the TMDb API but is not endorsed or certified by TMDb.</p>
        <p style={{ color: '#aaa', fontSize: '14px' }}>© 2026 MyMovieList. All rights reserved.</p>
      </footer>
    </div>

    
  )
}

export default App