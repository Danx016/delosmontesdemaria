const csrf = require('csurf');

// Configurar dos instancias del middleware 'csurf' usando cookies
// Una para peticiones locales HTTP (secure: false) y otra para HTTPS (secure: true)
const csrfHTTP = csrf({
  cookie: {
    key: 'csrfToken',
    httpOnly: false,
    sameSite: 'lax',
    secure: false
  }
});

const csrfHTTPS = csrf({
  cookie: {
    key: 'csrfToken',
    httpOnly: false,
    sameSite: 'lax',
    secure: true
  }
});

function csrfMiddleware(req, res, next) {
  // Eximir las rutas de API REST, Socket.io, estáticos y multimedia
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/socket.io') ||
    req.path.startsWith('/uploads') ||
    req.path.startsWith('/img') ||
    req.path === '/favicon.ico'
  ) {
    return next();
  }

  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const currentCsrf = isSecure ? csrfHTTPS : csrfHTTP;

  // En métodos seguros de lectura (GET, HEAD, OPTIONS), no se bloquea la navegación de la SPA
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    currentCsrf(req, res, (err) => {
      if (!err && typeof req.csrfToken === 'function') {
        try {
          const token = req.csrfToken();
          res.cookie('XSRF-TOKEN', token, {
            httpOnly: false,
            sameSite: 'lax',
            secure: isSecure
          });
        } catch (_) {}
      }
      return next();
    });
    return;
  }

  // En métodos mutativos (POST, PUT, DELETE, PATCH) fuera de /api, validar estrictamente
  currentCsrf(req, res, (err) => {
    if (err) {
      console.warn(`[SECURITY] Bloqueo CSRF en ${req.method} ${req.originalUrl}:`, err.message);
      return res.status(403).json({
        error: 'Acceso denegado: Token CSRF inválido o faltante en la petición.'
      });
    }

    if (typeof req.csrfToken === 'function') {
      try {
        const token = req.csrfToken();
        res.cookie('XSRF-TOKEN', token, {
          httpOnly: false,
          sameSite: 'lax',
          secure: isSecure
        });
      } catch (_) {}
    }

    next();
  });
}

module.exports = csrfMiddleware;
