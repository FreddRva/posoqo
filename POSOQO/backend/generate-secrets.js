// Script Node.js para generar secretos JWT seguros
// Uso: node generate-secrets.js

const crypto = require('crypto');

console.log('Generando secretos JWT seguros...\n');

// Generar secretos aleatorios de 64 bytes (512 bits) en base64
const accessSecret = crypto.randomBytes(64).toString('base64');
const refreshSecret = crypto.randomBytes(64).toString('base64');

console.log('JWT_ACCESS_SECRET=' + accessSecret);
console.log('JWT_REFRESH_SECRET=' + refreshSecret);
console.log('\nCopia estos valores y configúralos en tu archivo .env o variables de entorno');


