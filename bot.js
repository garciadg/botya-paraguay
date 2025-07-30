const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const sock = makeWASocket({
    version: [2, 2412, 6],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, fs)
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if (qr) {
      console.log('\n📲 Escaneá este QR con tu WhatsApp:\n');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') {
      console.log('✅ Bot conectado exitosamente a WhatsApp.');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const numero = msg.key.remoteJid;

    if (texto === '1') {
      await sock.sendMessage(numero, { text: '📸 Servicios disponibles: fotografía, eventos, bodas y más.' });
    } else if (texto === '2') {
      await sock.sendMessage(numero, { text: '💰 Consultá nuestros precios promocionales por WhatsApp.' });
    } else if (texto === '3') {
      await sock.sendMessage(numero, { text: '🤝 En breve te contactará una persona. ¡Gracias!' });
    } else {
      await sock.sendMessage(numero, {
        text: '🙌 ¡Hola! Escribí el número de la opción que querés:\n1️⃣ Ver servicios\n2️⃣ Consultar precios\n3️⃣ Hablar con un humano'
      });
    }
  });
}

iniciarBot();