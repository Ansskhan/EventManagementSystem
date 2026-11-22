import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../api'

export default function ExhibitorsPage() {
  const [exhibitors, setExhibitors] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadExhibitors() {
    try {
      setExhibitors(await api('/exhibitor/getexhibitor'))
      setError('')
    } catch (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadExhibitors()
  }, [])

  async function deleteExhibitor(exhibitor) {
    const label = exhibitor.CompanyName || exhibitor.UserId?.name || 'this exhibitor'
    const confirmed = window.confirm(
      `Delete ${label}? This also removes their account, applications, booth assignments and sessions. This cannot be undone.`,
    )
    if (!confirmed) return

    setBusy(true)
    setError('')
    setMessage('')
    try {
      await api('/exhibitor/deleteexhibitor/' + exhibitor._id, 'DELETE')
      await loadExhibitors()
      setMessage(`${label} was deleted.`)
    } catch (error) {
      setError(error.message)
    }
    setBusy(false)
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return exhibitors
    return exhibitors.filter((exhibitor) => {
      const haystack = [
        exhibitor.CompanyName,
        exhibitor.category,
        exhibitor.contactEmail,
        exhibitor.phone,
        exhibitor.UserId?.name,
        exhibitor.UserId?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [exhibitors, search])

  const approvedCount = exhibitors.filter(
    (exhibitor) => exhibitor.UserId?.approvalStatus === 'approved',
  ).length
  const bookedBooths = exhibitors.reduce((total, exhibitor) => total + (exhibitor.boothCount || 0), 0)

  return (
    <div className="dash-view">
      <div className="page-intro">
        <div>
          <span className="dash-eyebrow">EXHIBITORS</span>
          <h1>Manage the companies on your floor.</h1>
        </div>
      </div>

      <div className="management-summary">
        <div>
          <span>Total exhibitors</span>
          <strong>{exhibitors.length}</strong>
        </div>
        <div>
          <span>Approved accounts</span>
          <strong>{approvedCount}</strong>
        </div>
        <div>
          <span>Booths assigned</span>
          <strong>{bookedBooths}</strong>
        </div>
      </div>

      <input
        className="page-search"
        aria-label="Search exhibitors"
        placeholder="Search company, contact, email or category"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error && (
        <p className="api-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="api-message" role="status">
          {message}
        </p>
      )}
      {loading && <p role="status">Loading exhibitors...</p>}
      {!loading && !filtered.length && (
        <p className="empty-state">
          {exhibitors.length ? 'No exhibitors match your search.' : 'No exhibitors yet.'}
        </p>
      )}

      {!!filtered.length && (
        <div className="management-table-wrap">
          <table className="management-table">
            <thead>
              <tr>
                <th>Exhibitor</th>
                <th>Contact</th>
                <th>Booths</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exhibitor) => {
                const account = exhibitor.UserId || {}
                const hasAccount = Boolean(exhibitor.UserId)
                const status = hasAccount ? account.approvalStatus || 'approved' : 'no account'
                const initials = (exhibitor.CompanyName || account.name || '?')
                  .trim()
                  .charAt(0)
                  .toUpperCase()

                return (
                  <tr key={exhibitor._id}>
                    <td>
                      <div className="management-event">
                        <span className="management-event-thumb">
                          {exhibitor.logoUrl ? (
                            <img
                              src={exhibitor.logoUrl}
                              alt=""
                              onError={(event) => (event.currentTarget.style.display = 'none')}
                            />
                          ) : (
                            initials
                          )}
                        </span>
                        <div>
                          <strong>{exhibitor.CompanyName || 'Unnamed company'}</strong>
                          <small>{exhibitor.category || 'General'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="management-meta">
                        <strong>{account.name || exhibitor.contactPerson || '—'}</strong>
                        <small>
                          {account.email || exhibitor.contactEmail || (hasAccount ? '—' : 'No linked account')}
                        </small>
                        {exhibitor.phone && <small>{exhibitor.phone}</small>}
                      </div>
                    </td>
                    <td>{exhibitor.boothCount || 0}</td>
                    <td>{exhibitor.applicationCount || 0}</td>
                    <td>
                      <span className={`management-status management-status-${status}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="management-actions">
                        <button
                          className="management-button management-button-danger"
                          disabled={busy}
                          onClick={() => deleteExhibitor(exhibitor)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
