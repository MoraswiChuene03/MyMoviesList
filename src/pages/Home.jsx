import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [trendingMovies, setTrendingMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [genres, setGenres] = useState([])
  const [activeGenre, setActiveGenre] = useState('')
  const [page, setPage] = useState(1) 

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY

  useEffect(() => {
    const fetchGenres = async () => {
      const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`)
      const data = await res.json()
      setGenres(data.genres)
    }
    fetchGenres()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      const fetchTrendingMovies = async () => {
        if (page === 1) setLoading(true) 
        try {
          let url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=${page}`
          
          if (activeGenre) {
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${activeGenre}&page=${page}`
          }

          const response = await fetch(url)
          const data = await response.json()

          if (page === 1) {
            setTrendingMovies(data.results)
          } else {
            setTrendingMovies(prevMovies => [...prevMovies, ...data.results])
          }
          
        } catch (error) {
          console.error("Error fetching trending movies:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchTrendingMovies()
      return
    }

    const delayDebounceFn = setTimeout(() => {
      const fetchSearchResults = async () => {
        setLoading(true)
        try {
          const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`)
          const data = await response.json()
          setTrendingMovies(data.results)
        } catch (error) {
          console.error("Error fetching search results:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchSearchResults()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
    
  // FIX: Added activeGenre to the dependency array so clicking genres triggers a refetch
  }, [searchQuery, page, activeGenre]) 

  return (
    <div style={{ padding: '20px' }}>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search for movies..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(1)
          }}
          style={{ width: '300px', padding: '10px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#222', color: 'white' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => { setActiveGenre(''); setPage(1); }}
          style={{ backgroundColor: activeGenre === '' ? '#00d2ff' : '#333', color: activeGenre === '' ? '#090909' : 'white', borderRadius: '20px', padding: '8px 16px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Trending 
        </button>
        {genres.map(genre => (
          <button 
            key={genre.id}
            onClick={() => { setActiveGenre(genre.id); setPage(1); setSearchQuery(''); }}
            style={{ backgroundColor: activeGenre === genre.id ? '#00d2ff' : '#333', color: activeGenre === genre.id ? '#090909' : 'white', borderRadius: '20px', padding: '8px 16px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <h2 style={{ color: 'white', fontSize: "28px", marginBottom: "20px" }}>
        {searchQuery ? `Results for "${searchQuery}"` : 'Trending Movies This Week 🔥'}
      </h2>

      {loading ? (
        <div style={{ color: 'white' }}>Loading movies...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          {trendingMovies.map((movie) => (
            <Link 
              to={`/movie/${movie.id}`} 
              key={movie.id} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ backgroundColor: '#1f1f1f', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', height: '100%' }}>
                <img 
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Poster'} 
                  alt={movie.title} 
                  style={{ width: '100%', height: '280px', objectFit: 'cover' }}
                />
                
                <div style={{ padding: '12px' }}>
                  <h3 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {movie.title}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#aaa' }}>
                    <span>{movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</span>
                    <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>⭐ {movie.vote_average?.toFixed(1)}</span>
                  </div>  
                </div>
              </div>
            </Link> 
          ))}
        </div>
      )}
      {!searchQuery && !loading && (
        <div style={{ marginTop: '30px', textAlign: 'center', color: '#aaa' }}>
          <button
            onClick={() => setPage(prev => prev + 1)}
            style={{ backgroundColor: '#00d2ff', color: '#090909', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >Load More</button>
        </div>
      )}
    </div>
  )
}

export default Home