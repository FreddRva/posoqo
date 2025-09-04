// Script para probar la conexión del backend
const https = require('https');
const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

console.log('🔍 Probando conexión al backend...');
console.log(`URL: ${BACKEND_URL}`);

function testBackend() {
  const url = new URL(`${BACKEND_URL}/health`);
  const client = url.protocol === 'https:' ? https : http;
  
  const req = client.request(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Backend funcionando correctamente!');
        console.log('📊 Respuesta:', response);
      } catch (error) {
        console.log('❌ Error parseando respuesta:', error.message);
        console.log('📄 Respuesta raw:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Error conectando al backend:', error.message);
    console.log('💡 Asegúrate de que el backend esté ejecutándose');
  });
  
  req.setTimeout(5000, () => {
    console.log('⏰ Timeout: El backend no respondió en 5 segundos');
    req.destroy();
  });
  
  req.end();
}

testBackend();
