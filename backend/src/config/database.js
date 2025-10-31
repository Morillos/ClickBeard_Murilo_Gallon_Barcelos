/**
 * Configuração do Banco de Dados PostgreSQL
 *
 * Este módulo configura e exporta o pool de conexões com o banco de dados.
 *
 * Pool de Conexões:
 * O pg.Pool gerencia múltiplas conexões ao banco de dados, reutilizando-as
 * para melhor performance. Isso evita criar uma nova conexão a cada query.
 *
 * Uso:
 * - db.query(text, params) - Para queries simples
 * - db.pool.connect() - Para transações que precisam de BEGIN/COMMIT/ROLLBACK
 *
 * Variáveis de ambiente necessárias (.env):
 * - DB_HOST: Endereço do servidor PostgreSQL
 * - DB_PORT: Porta do PostgreSQL (padrão: 5432)
 * - DB_NAME: Nome do banco de dados
 * - DB_USER: Usuário do banco de dados
 * - DB_PASSWORD: Senha do usuário
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool de conexões
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'clickbeard',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Event listener - conexão bem-sucedida
pool.on('connect', () => {
  console.log('✓ Database connected successfully');
});

// Event listener - erro inesperado na conexão
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
