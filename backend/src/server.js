// Consolidated minimal server — loads optional modules if present
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3001';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Connect to DB if config exists
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/menu';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.warn('MongoDB not available:', err.message));

app.get('/', (req, res) => res.json({ status: 'ok', app: 'menu-backend' }));

// Try to mount known routes if present
try { app.use('/api/pedidos', require('./routes/pedidos')); } catch {};
try { app.use('/api/catalogo', require('./routes/catalogo')); } catch {};
try { app.use('/api/admin', require('./routes/admin')); } catch {};
try { app.use('/api/auth', require('./routes/auth')); } catch {};
try { app.use('/api/produtos', require('./routes/produtos')); } catch {};
try { app.use('/api/pagamentos', require('./routes/pagamentos')); } catch {};
try { app.use('/webhooks', require('./routes/webhooks')); } catch {};

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: corsOrigin } });
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

server.listen(PORT, () => console.log(`Servidor MENU rodando na porta ${PORT}`));

