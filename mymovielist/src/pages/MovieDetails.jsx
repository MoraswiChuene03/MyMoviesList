import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function MovieDetails() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [movie, setMovie] = useState(null)
  const [ cast, setCast ] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Plan to Watch') 
  const [userScore, setUserScore] = useState('')
  const [review, setReview] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

    const API_KEY = import.meta.env.VITE_TMDB_API_KEY

    useEffect(() => {

        // Get the current Supabase session to know whether the user is authenticated.
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null)
        })

        const fetchMovieDetails = async () => {
            try {

                const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=videos,credits`);
                const data = await response.json();
        
                setMovie(data);
                setCast(data.credits?.cast?.slice(0, 5) || []); 
                setLoading(false);
                } catch (error) {
                console.error("Error fetching movie details:", error);
                setLoading(false);
             }

        }

        fetchMovieDetails()
    }, [id])

    const handleSave = async (e) => {
        e.preventDefault()
        if (!user) {
            setSaveMessage('You must be logged in to save this movie.')
            return
        }
        setSaving(true)
        setSaveMessage('')

        try {
            // Upsert the user's movie progress into the user_movies table.
            // onConflict:'id, user_id' prevents duplicate rows for the same user/movie pair.
            const {error} = await supabase
                .from('user_movies')
                .upsert({
                    id: parseInt(id),
                    title: movie.title,
                    status: status,
                    user_score: userScore ? parseInt(userScore) : null,
                    review: review,
                    user_id: user.id
                }, {onConflict:'id, user_id'})
            if (error) throw error
            setSaveMessage('Movie saved to your profile!')
        } catch (error) {
            console.error("Error saving movie:", error)
            setSaveMessage('Failed to save movie. Please try again.')
        } finally {
            setSaving(false)
        }}

    if (loading) {
        return <div style={{ color: 'white', padding: '20px' }}>Loading movie details...</div>
    }
    if (!movie) {
        return <div style={{ color: 'white', padding: '20px' }}>Movie not found.</div>
    }

    return ( 
        <div style={{ color: 'white', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Back Button */}
            <Link to="/" style={{ color: 'blue', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
                &larr; Back to Movie List
            </Link>

            {/*Main Layout Split */}
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {/*Left Side - Movie Poster*/}
                <div style={{ flex: '1 1 300px', maxWidth: '300px' }}>
                    <img 
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}
                        alt={movie.title}
                        style={{ width: '100%', height: 'auto' }}
                    />
                </div>

                {/* Log Tracking Box */}
                <div style={{ backgroundColor: '#1f1f1f', padding: '20px', borderRadius: '8px', maxWidth: '400px' }}>
                    <h3 style={{ color: '#00d2ff', marginBottom: '15px' }}>Track Your Progress</h3>

                    {user ? (
                    <form onSubmit={handleSave}>
                        {/* Status Dropdown */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#222', color: 'white', border: '1px solid #333' }}>
                                <option value="Plan to Watch">Plan to Watch</option>
                                <option value="Completed">Completed</option>
                                <option value="Dropped">Dropped</option>
                            </select>
                        </div>

                        {/* User Score Input */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Your Score(0-10)</label>
                            <select value={userScore} onChange={(e) => setUserScore(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#222', color: 'white', border: '1px solid #333' }}>
                                <option value="">N/A</option>
                                {[...Array(11).keys()].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                        {/* Review Textarea */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Your Review</label>
                            <textarea value={review} onChange={(e) => setReview(e.target.value)} rows="4" style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#222', color: 'white', border: '1px solid #333' }} placeholder="Write your thoughts about the movie..."></textarea>
                        </div>

                        <button type="submit" disabled={saving} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: saving ? '#555' : '#00d2ff', color: 'white', border: 'none', fontWeight: 'bold' }}>
                            {saving ? 'Saving...' : 'Save to Profile'}
                        </button>
                        


                    </form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px'}}>
                            <p style={{ marginBottom: '15px' }}>Please log in to track your movie progress and save reviews.</p>
                            <Link to="/login" style={{ backgroundColor: '#00d2ff', color: '#090909', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                                Sign In to Track & Review
                            </Link>
                        </div>
                    )}
                    {saveMessage && <p style={{ marginTop: '15px', color: saveMessage.includes('Failed') ? '#ff5555' : '#55ff55' }}>{saveMessage}</p>}
                </div>

                {/*Right Side - Movie Info*/}
                <div style={{ flex: '2 1 500px' }}>
                    <h1 style={{ fontSize: '32px', marginBottom: '10px', color: 'white' }}>{movie.title} ({new Date(movie.release_date).getFullYear()})</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <span>{movie.release_date?.slice(0, 4) || 'N/A'}</span>
                        <span>{movie.runtime} minutes</span>
                        <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>⭐ {movie.vote_average?.toFixed(1)}</span>
                    </div>

                    <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Overview</h3>
                    <p style={{ lineHeight: '1.6', marginBottom: '30px' }}>{movie.overview}</p>

                    {movie.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube') && (
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Trailer</h3>
                            {/* Only embed the first available YouTube trailer. */}
                            <iframe width="100%" height="315" src={`https://www.youtube.com/embed/${movie.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube')?.key}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        </div>
                    )}
                    <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Genres</h3>
                    <p style={{ marginBottom: '30px' }}>{movie.genres?.map((genre) => genre.name).join(', ') || 'N/A'}</p>

                    <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Top Cast</h3>
                    <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                        {cast.length > 0 ? (
                            cast.map((actor) => (
                                <li key={actor.id} style={{ marginBottom: '10px' }}>
                                    <strong>{actor.name}</strong> as {actor.character}
                                </li>
                            ))
                        ) : (
                            <p>No cast information available.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default MovieDetails

