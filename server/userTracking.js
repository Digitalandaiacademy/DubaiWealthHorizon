const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Stockage en mémoire des sessions (à remplacer par une base de données en production)
const activeSessions = new Map();

io.on('connection', (socket) => {
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  const userAgent = socket.handshake.headers['user-agent'];
  const parser = new UAParser(userAgent);
  const device = parser.getResult();
  const geo = geoip.lookup(clientIp) || { city: 'Inconnue', country: 'Inconnu' };

  socket.on('userConnected', ({ userId, username }) => {
    const sessionData = {
      id: socket.id,
      userId,
      username,
      isOnline: true,
      device: {
        type: device.device.type || 'desktop',
        browser: device.browser.name,
        os: device.os.name
      },
      location: {
        country: geo.country,
        city: geo.city
      },
      currentPage: '/',
      connectionTime: new Date(),
      lastActivity: new Date()
    };

    activeSessions.set(socket.id, sessionData);
    broadcastActiveSessions();
  });

  socket.on('pageChange', (page) => {
    const session = activeSessions.get(socket.id);
    if (session) {
      session.currentPage = page;
      session.lastActivity = new Date();
      activeSessions.set(socket.id, session);
      broadcastActiveSessions();
    }
  });

  socket.on('disconnect', () => {
    const session = activeSessions.get(socket.id);
    if (session) {
      session.isOnline = false;
      session.lastActivity = new Date();
      // Garder la session pendant 5 minutes avant de la supprimer
      setTimeout(() => {
        activeSessions.delete(socket.id);
        broadcastActiveSessions();
      }, 5 * 60 * 1000);
      broadcastActiveSessions();
    }
  });
});

function broadcastActiveSessions() {
  io.emit('userSessions', Array.from(activeSessions.values()));
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
