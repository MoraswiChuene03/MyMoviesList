import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const [user, setUser] = useState(null)
  const [userMovies, setUserMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('title') 

  
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserAndMovies = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser(authUser)
        } else {
          navigate('/login')
          return
        }

        const { data, error } = await supabase
          .from('user_movies')
          .select('*')

        if (error) throw error
        setUserMovies(data || [])
      } catch (error) {
        console.error("Error fetching user movies:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserAndMovies()
  }, [navigate]) 

  const handleDelete = async (movieId) => {
    if (!window.confirm('Are you sure you want to remove this movie from your profile?')) return

    if (!user) {
      alert("User session not found. Please log in again.")
      return
    }

    try {
      const { error } = await supabase
        .from('user_movies')
        .delete()
        .eq('id', movieId)
        .eq('user_id', user.id)

      if (error) throw error

      setUserMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieId))
    } catch (error) {
      console.error("Error deleting movie:", error)
    }
  }

  const sortMovies = (movies) => {
    return [...movies].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'score_high') return (b.user_score || 0) - (a.user_score || 0)
      if (sortBy === 'score_low') return (a.user_score || 0) - (b.user_score || 0)
      return 0
    })
  }

  const completedMovies = sortMovies(userMovies.filter(m => m.status === "Completed"))
  const watchlistMovies = sortMovies(userMovies.filter(m => m.status === "Plan to Watch"))
  const droppedMovies = sortMovies(userMovies.filter(m => m.status === "Dropped"))

  const MovieTable = ({ title, list }) => (
    <div style={{ marginBottom: '40px' }}>
      <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '8px', color: '#00d2ff' }}>{title}</h3>
      {list.length === 0 ? (
        <p style={{ color: '#aaa' }}>No movies in this category yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#222', color: '#aaa', fontSize: '14px' }}>
              <th style={{ padding: '10px', borderBottom: '1px solid #333' }}>Movie Title</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #333' }}>Your Score</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #333' }}>Your Review</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #333' }}></th>
            </tr>
          </thead>
          <tbody>
            {list.map(movie => (
              <tr key={movie.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{movie.title}</td>
                <td style={{ padding: '10px', color: '#ffcc00' }}>
                  {movie.user_score !== null ? `⭐ ${movie.user_score}/10` : 'N/A'}
                </td>
                <td style={{ padding: '10px', fontStyle: 'italic', color: '#aaa' }}>
                  {movie.review ? `"${movie.review}"` : 'No review yet.'}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(movie.id)}
                    style={{ 
                      backgroundColor: '#ff5555', 
                      color: 'white', 
                      border: 'none', 
                      padding: '6px 10px', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

  if (loading) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading profile...</div>
  }

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>My Profile</h2>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            backgroundColor: '#222', 
            color: 'white', 
            border: '1px solid #444', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          <option value="title">Sort by Title (A-Z)</option>
          <option value="score_high">Highest Score First</option>
          <option value="score_low">Lowest Score First</option>
        </select>
      </div>

      <p style={{ color: '#aaa', marginTop: '0', marginBottom: '30px' }}>
        Welcome back! Here's a summary of your movie lists and reviews.
      </p>

      <MovieTable title="Completed Movies" list={completedMovies} />
      <MovieTable title="Watchlist" list={watchlistMovies} />
      <MovieTable title="Dropped Movies" list={droppedMovies} />
    </div>
  )
}

export default Profile