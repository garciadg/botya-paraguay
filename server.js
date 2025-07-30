const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'formulario.html'));
});

app.post('/guardar', (req, res) => {
  const datos = {
    nombre: req.body.nombre,
    instagram: req.body.instagram,
    facebook: req.body.facebook,
    tiktok: req.body.tiktok,
    correo: req.body.correo,
    whatsapp: req.body.whatsapp
  };

  fs.writeFileSync('./config-cliente.json', JSON.stringify(datos, null, 2));
  console.log('✅ Datos del cliente guardados.');

  const proceso = spawn('node', ['bot.js'], { stdio: 'inherit' });
  proceso.on('close', (code) => {
    console.log(`👋 El bot finalizó con código ${code}`);
  });

  res.send('<p style="color:green">✅ Datos guardados. Escaneá el QR desde consola.<br><a href="/">Volver</a></p>');
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('🌐 Servidor activo en Railway 🚀');
});