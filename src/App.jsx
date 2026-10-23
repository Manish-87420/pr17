import { useEffect, useState } from 'react'
import './App.css'

const STUDENTS_API = 'https://jsonplaceholder.typicode.com/users'

function StudentCard({ student }) {
  const initials = student.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

  return (
    <article className="student-card">
      <div className={`student-avatar avatar-${student.id % 5}`}>{initials}</div>
      <div className="student-details">
        <div className="student-name-row">
          <h2>{student.name}</h2>
          <span className="student-id">STU-{String(student.id).padStart(3, '0')}</span>
        </div>
        <a className="student-email" href={`mailto:${student.email}`}>{student.email}</a>
        <div className="student-meta">
          <span><span aria-hidden="true">⌖</span> {student.address.city}</span>
          <span><span aria-hidden="true">▧</span> {student.company.name}</span>
        </div>
      </div>
      <a className="student-contact" href={`mailto:${student.email}`} aria-label={`Email ${student.name}`}>
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  )
}

function App() {
  const [students, setStudents] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchStudents() {
      setStatus('loading')
      setError('')

      try {
        const response = await fetch(STUDENTS_API, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Could not load students (HTTP ${response.status}).`)
        }

        const records = await response.json()
        if (!Array.isArray(records)) {
          throw new Error('The student service returned data in an unexpected format.')
        }

        setStudents(records)
        setStatus('success')
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          return
        }

        setError(fetchError.message || 'Could not load student records. Please try again.')
        setStatus('error')
      }
    }

    fetchStudents()

    return () => controller.abort()
  }, [refreshKey])

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.email} ${student.address.city} ${student.company.name}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#main" className="brand" aria-label="Northfield campus home">
          <span className="brand-mark"><span /><span /><span /></span>
          <span>NORTHFIELD<small>STUDENT HUB</small></span>
        </a>
        <div className="sidebar-label">CAMPUS</div>
        <nav className="sidebar-nav" aria-label="Campus navigation">
          <a href="#overview"><span>⌂</span> Overview</a>
          <a className="active" href="#students"><span>♧</span> Students <b>{students.length || '—'}</b></a>
          <a href="#courses"><span>▤</span> Courses</a>
          <a href="#calendar"><span>▦</span> Calendar</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="term-card"><span className="term-dot" /><span><small>CURRENT TERM</small><strong>Fall semester ’25</strong></span></div>
          <div className="profile-card"><span className="profile-avatar">AD</span><span><strong>Admin Desk</strong><small>Campus administrator</small></span><span className="profile-menu">···</span></div>
        </div>
      </aside>

      <main className="main-content" id="main">
        <header className="topbar">
          <div className="breadcrumbs"><span>Campus</span><span>/</span><strong>Students</strong></div>
          <div className="topbar-right"><span className="term-pill"><span /> FALL 2025</span><span className="topbar-separator" /><button className="notification-button" type="button" aria-label="Notifications">♧<i /></button><span className="profile-avatar small-avatar">AD</span></div>
        </header>

        <div className="page-content">
          <section className="welcome-banner">
            <div className="welcome-copy">
              <div className="eyebrow"><span /> YOUR CAMPUS, AT A GLANCE</div>
              <h1>Students, <em>together.</em></h1>
              <p>A little directory to help you find your people.</p>
            </div>
            <div className="banner-art" aria-hidden="true">
              <span className="art-sun" />
              <span className="art-orbit orbit-a" />
              <span className="art-orbit orbit-b" />
              <span className="art-avatar art-a">J</span>
              <span className="art-avatar art-b">M</span>
              <span className="art-avatar art-c">A</span>
              <span className="art-avatar art-d">L</span>
            </div>
          </section>

          <section className="directory-section" id="students">
            <div className="section-heading">
              <div><span className="section-kicker">PEOPLE MAKE THE PLACE</span><h2>Student directory <span className="count-chip">{status === 'success' ? students.length : '—'}</span></h2><p>Meet the students who make Northfield feel like home.</p></div>
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input type="search" aria-label="Search students" placeholder="Search students..." value={search} onChange={(event) => setSearch(event.target.value)} disabled={status !== 'success'} />
                <kbd>⌘ K</kbd>
              </label>
            </div>

            <div className="directory-toolbar"><span>{status === 'success' ? `Showing ${filteredStudents.length} of ${students.length} students` : 'Student records'}</span><span className="source-label"><span /> DATA FROM JSONPLACEHOLDER</span></div>

            {status === 'loading' && (
              <div className="state-panel" role="status">
                <span className="loader" />
                <strong>Finding your people...</strong>
                <p>Loading the student directory.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="state-panel error-panel" role="alert">
                <span className="error-mark">!</span>
                <strong>We couldn’t load the directory</strong>
                <p>{error}</p>
                <button type="button" className="retry-button" onClick={() => setRefreshKey((key) => key + 1)}>Try again</button>
              </div>
            )}

            {status === 'success' && filteredStudents.length > 0 && (
              <div className="student-list">
                {filteredStudents.map((student) => <StudentCard key={student.id} student={student} />)}
              </div>
            )}

            {status === 'success' && filteredStudents.length === 0 && (
              <div className="state-panel empty-panel">
                <span className="empty-mark">⌕</span>
                <strong>No students found</strong>
                <p>Try searching by a different name, email, or location.</p>
              </div>
            )}
          </section>

          <footer className="page-footer"><span>© 2025 NORTHFIELD UNIVERSITY</span><span>FIND YOUR PLACE <b>✳</b></span></footer>
        </div>
      </main>
    </div>
  )
}

export default App
