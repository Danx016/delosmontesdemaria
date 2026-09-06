import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { login as loginApi, loginGoogle as loginGoogleApi } from '../api/auth.api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSuspended, setIsSuspended] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAuthSuccess = (token, userData) => {
    login(token, userData)
    const roleId = Number(userData?.rol ?? userData?.id_rol)
    if (roleId === 1) {
      navigate('/admin')
    } else if (roleId === 2) {
      navigate('/vendedor')
    } else {
      navigate('/')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSuspended(false)
    setLoading(true)
    try {
      const res = await loginApi(correo, contrasena)
      const token = res.data?.token
      const userData = res.data?.usuario || res.data?.user || res.data
      if (token) {
        handleAuthSuccess(token, userData)
      } else {
        setError('Respuesta del servidor inválida.')
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Credenciales incorrectas o error en el servidor.'
      const suspended = err.response?.data?.isSuspended || err.response?.status === 403 || errMsg.toLowerCase().includes('suspendida')
      setIsSuspended(suspended)
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setIsSuspended(false)
    setLoading(true)
    try {
      const res = await loginGoogleApi(credentialResponse.credential)
      const token = res.data?.token
      const userData = res.data?.usuario || res.data?.user || res.data
      if (token) {
        handleAuthSuccess(token, userData)
      } else {
        setError('Respuesta del servidor inválida con Google.')
      }
    } catch (err) {
      console.error('Error Google Auth:', err)
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Error al iniciar sesión con Google.'
      const suspended = err.response?.data?.isSuspended || err.response?.status === 403 || errMsg.toLowerCase().includes('suspendida')
      setIsSuspended(suspended)
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-wrap">
      <div className="auth-card fade-in">
        {/* Brand */}
        <div className="auth-brand">
          <img
            src="/img/Logo.jpg"
            alt="Logo"
            className="auth-brand-img"
            onError={(e) => { e.target.src = '/img/Logo.jpg' }}
          />
          <h1>Bienvenido de Vuelta</h1>
          <p>Ingresa a tu cuenta de De los Montes de María</p>
        </div>

        {/* Suspended Account Card Banner */}
        {isSuspended ? (
          <div className="fade-in" style={{ background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '14px', padding: '1rem', color: '#991b1b', textAlign: 'left', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ background: '#fee2e2', color: '#dc2626', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>
                <i className="fa fa-user-slash" />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '0.98rem', color: '#991b1b', marginBottom: '0.25rem' }}>
                  🚫 Tu cuenta ha sido suspendida
                </strong>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#7f1d1d', lineHeight: 1.45 }}>
                  {error || 'El acceso a tu cuenta se encuentra temporalmente restringido por la administración de De los Montes de María.'}
                </p>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link
                    to="/soporte"
                    className="btn btn-sm"
                    style={{ background: '#dc2626', color: '#ffffff', textDecoration: 'none', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <i className="fa fa-headset" /> Contactar a Soporte
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="global-alert error fade-in">
            <i className="fa fa-exclamation-circle" /> {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="correo">Correo Electrónico o Usuario</label>
            <input
              id="correo"
              type="text"
              required
              placeholder="ejemplo@correo.com o @usuario"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="form-field">
            <div className="auth-label-row">
              <label htmlFor="contrasena">Contraseña</label>
              <Link to="/recuperar" className="auth-forgot-link">¿Olvidaste tu contraseña?</Link>
            </div>
            <div className="auth-password-wrap">
              <input
                id="contrasena"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="form-submit-btn">
            {loading
              ? <><i className="fa fa-spinner fa-spin" /> Iniciando...</>
              : <><i className="fa fa-sign-in-alt" /> Iniciar Sesión</>
            }
          </button>
        </form>

        {/* Google Login */}
        <div className="auth-divider">
          <span>o continúa con</span>
        </div>
        <div className="google-auth-btn-wrap">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('No se pudo conectar con Google. Por favor intenta de nuevo.')}
            useOneTap={false}
            shape="pill"
            text="continue_with"
            size="large"
            theme="outline"
          />
        </div>

        <p className="auth-footer-text">
          ¿Aún no tienes cuenta? <Link to="/registro">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  )
}
