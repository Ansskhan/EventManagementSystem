import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../../api'
import { useAuth } from '../../../state/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setUser } = useAuth()
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: params.get('role') === 'exhibitor' ? 'exhibitor' : 'attendee',
    CompanyName: '',
    description: '',
    products: '',
    services: '',
    website: '',
    phone: '',
    category: '',
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [visible, setVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [touched, setTouched] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function update(event) {
    setValues({ ...values, [event.target.name]: event.target.value })
    setTouched({ ...touched, [event.target.name]: true })
  }

  function fieldError(name) {
    const value = values[name]?.trim() || ''
    if (name === 'name') return !value ? 'Full name is required.' : !/^[a-zA-Z\s]+$/.test(value) ? 'Use letters and spaces only.' : value.length < 3 ? 'Use at least 3 characters.' : ''
    if (name === 'email') return !value ? 'Email is required.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Enter a valid email address.' : ''
    if (name === 'password') return !value ? 'Password is required.' : !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value) ? 'Use 8+ characters with uppercase, lowercase, number, and symbol.' : ''
    if (name === 'confirmPassword') return !value ? 'Please confirm your password.' : value !== values.password ? 'Passwords do not match.' : ''
    if (name === 'CompanyName') return !value ? 'Company name is required.' : value.length < 3 ? 'Use at least 3 characters.' : ''
    if (name === 'category') return !value ? 'Category is required.' : ''
    if (name === 'phone') {
      if (values.role !== 'exhibitor') return ''
      return !value ? 'Business phone is required.' : !/^\d{10,15}$/.test(value) ? 'Use 10–15 digits.' : ''
    }
    if (name === 'description') return !value ? 'Company description is required.' : value.length < 10 ? 'Use at least 10 characters.' : ''
    if (name === 'website') {
      if (!value) return ''
      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
          ? ''
          : 'Enter a valid URL starting with http:// or https://.'
      } catch {
        return 'Enter a valid URL starting with http:// or https://.'
      }
    }
    if (['products', 'services'].includes(name)) return value && value.length < 3 ? 'Use at least 3 characters or leave it blank.' : ''
    return ''
  }

  const requiredFields = ['name', 'email', 'password', 'confirmPassword']
  const exhibitorFields = ['CompanyName', 'category', 'phone', 'description']
  const formValid = [...requiredFields, ...(values.role === 'exhibitor' ? exhibitorFields : []), 'website', 'products', 'services'].every(
    (field) => !fieldError(field),
  )

  function validationMessage(name) {
    const message = fieldError(name)
    return touched[name] && message ? <small className="auth-validation">{message}</small> : null
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!formValid) {
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
        website: true,
        products: true,
        services: true,
        ...(values.role === 'exhibitor'
          ? { CompanyName: true, category: true, phone: true, description: true }
          : {}),
      })
      return
    }
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(values.password)
    ) {
      setError(
        'Use at least 8 characters including uppercase, lowercase, a number, and a symbol (@$!%*?&).',
      )
      return
    }
    setBusy(true)
    try {
      const form = new FormData()
      form.append('name', values.name.trim())
      form.append('email', values.email.trim().toLowerCase())
      form.append('password', values.password)
      form.append('role', values.role)
      if (values.role === 'exhibitor') {
        form.append('CompanyName', values.CompanyName.trim())
        form.append('description', values.description.trim())
        form.append('products', values.products.trim())
        form.append('services', values.services.trim())
        form.append('website', values.website.trim())
        form.append('phone', values.phone.trim())
        form.append('category', values.category.trim())
        if (profilePicture) form.append('profilePicture', profilePicture)
      }
      const data = await api('/auth/register', 'POST', form)
      let next = '/verify-email?email=' + encodeURIComponent(values.email)
      if (data?.devVerificationPath) {
        next += '&devPath=' + encodeURIComponent(data.devVerificationPath)
      }
      navigate(next)
    } catch (error) {
      setError(error.message)
    }
    setBusy(false)
  }

  return (
    <main className="auth-page auth-register">
      <div className="auth-form-side">
        <header className="auth-header">
          <Link className="brand" to="/">
            EventSphere
          </Link>
          <Link className="auth-back" to="/">
            Back to home
          </Link>
        </header>
        <div className="auth-form-content">
          <span className="eyebrow">
            <span className="status-dot" />
            YOUR EVENT WORKSPACE
          </span>
          <h1>Find your place. Make your mark.</h1>
          <p className="auth-description">Create an account for your side of the event.</p>
          {error && (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <fieldset className="role-picker">
              <legend>I’m joining as an</legend>
              <div className="role-options">
                <label
                  className={values.role === 'attendee' ? 'role-option selected' : 'role-option'}
                >
                  <input
                    type="radio"
                    name="role"
                    value="attendee"
                    checked={values.role === 'attendee'}
                    onChange={update}
                  />
                  <strong>Attendee</strong>
                  <span>I’m here to discover</span>
                </label>
                <label
                  className={values.role === 'exhibitor' ? 'role-option selected' : 'role-option'}
                >
                  <input
                    type="radio"
                    name="role"
                    value="exhibitor"
                    checked={values.role === 'exhibitor'}
                    onChange={update}
                  />
                  <strong>Exhibitor</strong>
                  <span>I’m showcasing a brand</span>
                </label>
              </div>
            </fieldset>
            <div className="registration-fields">
            {values.role === 'exhibitor' && (
              <fieldset className="exhibitor-registration-fields">
               
                <div className="auth-field-row">
                  <label className="auth-field">
                    <span>Company name</span>
                    <input
                      name="CompanyName"
                      value={values.CompanyName}
                      onChange={update}
                      maxLength={50}
                    />
                    {validationMessage('CompanyName')}
                  </label>
                  <label className="auth-field">
                    <span>Category</span>
                    <input name="category" value={values.category} onChange={update} />
                    {validationMessage('category')}
                  </label>
                </div>
                <label className="auth-field">
                  <span>Business phone</span>
                  <input
                    name="phone"
                    type="tel"
                    value={values.phone}
                    onChange={update}
                    placeholder="10–15 digits"
                  />
                  {validationMessage('phone')}
                </label>
                <div className="auth-field-row">
                  <label className="auth-field">
                    <span>Products</span>
                    <input name="products" value={values.products} onChange={update} />
                  {validationMessage('products')}
                  </label>
                  <label className="auth-field">
                    <span>Services</span>
                    <input name="services" value={values.services} onChange={update} />
                  {validationMessage('services')}
                  </label>
                </div>
                <label className="auth-field">
                  <span>Website <small>(optional)</small></span>
                  <input name="website" type="url" value={values.website} onChange={update} />
                  {validationMessage('website')}
                </label>
                <label className="auth-field">
                  <span>Company description</span>
                  <textarea
                    name="description"
                    value={values.description}
                    onChange={update}
                    maxLength={1000}
                    rows={4}
                  />
                  {validationMessage('description')}
                </label>
                <label className="auth-field">
                  <span>Company logo / profile picture <small>(optional)</small></span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,.svg"
                    onChange={(event) => setProfilePicture(event.target.files[0] || null)}
                  />
                </label>
              </fieldset>
            )}
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <div className="auth-input-wrap">
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  onChange={update}
                  maxLength={30}
                />
              </div>
              {validationMessage('name')}
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-wrap">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={update}
                />
              </div>
              {validationMessage('email')}
              {values.role === 'exhibitor' && (
                <p className="field-hint">
                  This email is also your company&apos;s contact email.
                </p>
              )}
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={visible ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={update}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? 'Hide password' : 'Show password'}
                  title={visible ? 'Hide password' : 'Show password'}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationMessage('password')}
            </div>
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="auth-input-wrap">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={confirmVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={update}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setConfirmVisible(!confirmVisible)}
                  aria-label={confirmVisible ? 'Hide confirmed password' : 'Show confirmed password'}
                  title={confirmVisible ? 'Hide confirmed password' : 'Show confirmed password'}
                >
                  {confirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationMessage('confirmPassword')}
              <p className="field-hint">
                Use 8 or more characters with uppercase, lowercase, a number and a symbol (@$!%*?&).
              </p>
            </div>
            </div>

            <button className="button button-orange auth-submit" disabled={busy || !formValid}>
              {busy ? 'Please wait...' : 'Create account'}
            </button>
          </form>
          <p className="auth-switch">
            <Link to="/login">Back to sign in</Link>
          </p>
          <p className="field-hint">
            Exhibitor accounts need organizer approval before signing in.
          </p>
        </div>
        <footer className="auth-footer">
          <span>© {new Date().getFullYear()} EventSphere</span>
          <span>Bring people together.</span>
        </footer>
      </div>
      <aside className="auth-story">
        <div className="auth-story-image">
          <img src="/assets/expo-hall.png" alt="People coming together at a trade show" />
        </div>
        <div className="auth-story-content">
          <span className="eyebrow">GOOD PEOPLE. GREAT CONNECTIONS.</span>
          <h2>
            Every great event
            <br />
            starts with people.
          </h2>
          <p>Your plans, your connections, your next big moment. All in one place.</p>
          <div className="auth-story-rule" />
          <div className="auth-story-roles">
            <span>For the planners.</span>
            <span>For the brands.</span>
            <span>For the curious.</span>
          </div>
        </div>
      </aside>
    </main>
  )
}
