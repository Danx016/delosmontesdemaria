/**
 * Script de Diagnóstico y Prueba de Envío de Correos
 * Ejecuta: node scripts/probar_envio_correo.js [correo_destino]
 */
require('dotenv').config();
const EmailService = require('../src/infrastructure/external-services/EmailService');
const appConfig = require('../src/infrastructure/config/app.config');

async function testEmail() {
  const targetEmail = process.argv[2] || appConfig.smtp.user || 'danilorodelo355@gmail.com';

  console.log('========================================================');
  console.log('  🔍 DIAGNÓSTICO DE CORREO - DE LOS MONTES DE MARÍA');
  console.log('========================================================');
  console.log(`📌 Destinatario de prueba: ${targetEmail}`);
  console.log(`📌 SMTP Host configurado : ${appConfig.smtp.host}`);
  console.log(`📌 SMTP Port configurado : ${appConfig.smtp.port}`);
  console.log(`📌 SMTP User configurado : ${appConfig.smtp.user}`);
  console.log(`📌 Brevo API Key activa  : ${appConfig.brevoApiKey ? '✅ Sí' : '❌ No configurada'}`);
  console.log(`📌 Resend API Key activa : ${appConfig.resendApiKey ? '✅ Sí' : '❌ No configurada'}`);
  console.log('--------------------------------------------------------');
  console.log('🚀 Iniciando prueba de envío en vivo...\n');

  const emailService = new EmailService();

  try {
    const start = Date.now();
    const result = await emailService.sendWelcomeEmail(
      'Usuario de Prueba',
      targetEmail,
      'usuario_test'
    );
    const duration = ((Date.now() - start) / 1000).toFixed(2);

    if (result) {
      console.log('\n========================================================');
      console.log(`🎉 ¡ÉXITO! Correo entregado en ${duration} segundos.`);
      console.log(`📬 Revisa la bandeja de entrada (y Spam) de: ${targetEmail}`);
      console.log('========================================================\n');
      process.exit(0);
    } else {
      console.error('\n========================================================');
      console.error(`❌ FALLÓ el envío de correo.`);
      console.error('Revisa los mensajes de error en la consola arriba.');
      console.error('========================================================\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Excepción inesperada durante el envío:', error);
    process.exit(1);
  }
}

testEmail();
