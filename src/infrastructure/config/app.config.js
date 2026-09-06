require('dotenv').config();

function sanitize(val) {
  if (!val) return '';
  return val.replace(/^\"|\"$/g, '').replace(/^\'|\'$/g, '');
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  httpsPort: parseInt(process.env.HTTPS_PORT, 10) || 3443,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key_montes_de_maria',
  googleClientId: sanitize(process.env.GOOGLE_CLIENT_ID) || '',
  googleClientSecret: sanitize(process.env.GOOGLE_CLIENT_SECRET) || '',
  openRouterApiKey: sanitize(process.env.OPENROUTER_API_KEY) || '',
  openRouterModel: process.env.OPENROUTER_MODEL || 'minimax/minimax-m3:free',
  baseUrl: process.env.BASE_URL || 'https://delosmontesdemaria.duckdns.org',
  company: {
    name: 'DE LOS MONTES DE MARÍA S.A.S',
    nit: '1050277880',
    phone: '3008723989',
    formattedPhone: '+57 300 872 3989',
    email: sanitize(process.env.SMTP_USER) || 'danilorodelo355@gmail.com',
    address: 'El Carmen de Bolívar, Bolívar, Colombia',
    website: process.env.BASE_URL || 'https://delosmontesdemaria.duckdns.org'
  },
  wompi: {
    publicKey: process.env.WOMPI_PUBLIC_KEY || '',
    integrityKey: process.env.WOMPI_INTEGRITY_KEY || ''
  },

  smtp: {
    host: sanitize(process.env.SMTP_HOST) || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    user: sanitize(process.env.SMTP_USER) || '',
    pass: sanitize(process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '') || ''
  },
  brevoApiKey: sanitize(process.env.BREVO_API_KEY) || sanitize(process.env.SIB_API_KEY) || '',
  resendApiKey: sanitize(process.env.RESEND_API_KEY) || sanitize(process.env.RESEND_KEY) || ''
};

