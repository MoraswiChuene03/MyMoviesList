import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleAuth = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('') 

    try {
      if (isSignUp) {
        // Create a new account when the form is in signup mode.
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Sign-up successful! Please check your email to confirm your account.')
        setTimeout(() => navigate('/profile'), 1500)
      } else {
        // Authenticate an existing user with email and password.
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage('Login successful! Redirecting to your profile...')
        navigate('/profile')
      }
    } catch (error) {
      console.error("Authentication error:", error)
      setMessage(error.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  
  return (
    <div style={{ color: 'white', padding: '20px', maxWidth: '400px', margin: '50px auto', backgroundColor: '#222', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isSignUp ? 'Create an account' : 'Welcome Back'}</h2>

      <form onSubmit={handleAuth}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: '1px solid #555', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: '1px solid #555', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#00d2ff', color: '#090909', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          {isLoading ? (isSignUp ? 'Signing Up...' : 'Logging In...') : (isSignUp ? 'Sign Up' : 'Log In')}
        </button>
      </form>

      {message && <p style={{ marginTop: '15px', color: message.includes('successful') ? '#00ff00' : '#ff4444', textAlign: 'center' }}>{message}</p>}

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#aaa' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }} style={{ color: '#00d2ff', cursor: 'pointer', textDecoration: 'underline' }}>
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </span>
      </p>
    </div>
  )
}

export default Login