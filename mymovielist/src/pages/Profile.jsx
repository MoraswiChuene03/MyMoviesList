import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Profile() {
  
  const [user, setUser] = useState(null)
  const [userMovies, setUserMovies] = useState([])
  const [loading, setLoading] = useState(true)

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

        // Fetch user movies for the signed-in account.
        // This example assumes row-level security (RLS) or server-side filtering
        // ensures that only the current user's movies are returned.
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
  }, [])

  const handleDelete = async (movieId) => {
    if (!window.confirm('Are you sure you want to remove this movie from your profile?')) return

   
    if (!user) {
      alert("User session not found. Please log in again.")
      return
    }

    try {
      // Delete only the current user's movie record from Supabase.
      const { error } = await supabase
        .from('user_movies')
        .delete()
        .eq('id', movieId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update the local state to reflect the deletion instantly.
      setUserMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieId))
    } catch (error) {
      console.error("Error deleting movie:", error)
    }
  }

  // Divide the user's saved movies into the three tracked categories.
  const completedMovies = userMovies.filter(movie => movie.status === "Completed")
  const watchlistMovies = userMovies.filter(movie => movie.status === "Plan to Watch")
  const droppedMovies = userMovies.filter(movie => movie.status === "Dropped")

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
              {/* 3. FIXED: Added an empty column header so the table alignment balances out */}
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

                {/* The delete button row cell */}
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
      <h2 style={{ margin: '0 0 20px 0' }}>My Profile</h2>
      <p>Welcome back! Here's a summary of your movie lists and reviews.</p>
      <MovieTable title="Completed Movies" list={completedMovies} />
      <MovieTable title="Watchlist" list={watchlistMovies} />
      <MovieTable title="Dropped Movies" list={droppedMovies} />
    </div>
  )
}

export default Profile