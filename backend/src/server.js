/**
 * ClickBeard API Server
 *
 * Servidor principal da aplicação ClickBeard - Sistema de agendamento para barbearias
 *
 * Arquitetura:
 * - Express.js como framework web
 * - PostgreSQL como banco de dados relacional
 * - JWT para autenticação e autorização
 *
 * Rotas principais:
 * - /api/auth: Autenticação e registro de usuários
 * - /api/barbers: Gestão de barbeiros
 * - /api/specialties: Gestão de especialidades/serviços
 * - /api/appointments: Gestão de agendamentos
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const barberRoutes = require('./routes/barberRoutes');
const specialtyRoutes = require('./routes/specialtyRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// CORS - Permite requisições do frontend
app.use(cors());

// Parser de JSON para requisições
app.use(express.json());

// Parser de URL-encoded para formulários
app.use(express.urlencoded({ extended: true }));

// ========================================
// ROTAS DA API
// ========================================

app.use('/api/auth', authRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/appointments', appointmentRoutes);

// ========================================
// ROTAS DE UTILIDADE
// ========================================

// Health check - verifica se a API está respondendo
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ClickBeard API is running',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// TRATAMENTO DE ERROS
// ========================================

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('[ERROR] Erro não tratado:', err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Handler para rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║     ClickBeard API Server             ║
║     Running on port ${PORT}             ║
║     Environment: ${process.env.NODE_ENV || 'development'}          ║
╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
