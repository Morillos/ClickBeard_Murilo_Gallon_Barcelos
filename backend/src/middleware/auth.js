/**
 * Middlewares de Autenticação e Autorização
 *
 * Responsável por validar tokens JWT e controlar acesso às rotas protegidas.
 *
 * Fluxo de Autenticação:
 * 1. Cliente faz login em /api/auth/login
 * 2. Backend gera um JWT contendo: id, email e isAdmin
 * 3. Cliente armazena o token (localStorage)
 * 4. Cliente envia o token em todas as requisições: Authorization: Bearer <token>
 * 5. authMiddleware valida o token antes de permitir acesso à rota
 * 6. adminMiddleware verifica se o usuário tem permissão de administrador
 *
 * Uso nas rotas:
 * - router.get('/rota', authMiddleware, controller.metodo) -> Apenas usuários autenticados
 * - router.get('/rota', authMiddleware, adminMiddleware, controller.metodo) -> Apenas admins
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

/* Middleware de Autenticação */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Verifica se o header Authorization foi enviado
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Divide o header em duas partes: "Bearer" e o token
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    const [scheme, token] = parts;

    // Verifica se o esquema é "Bearer"
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    // Verifica e decodifica o token JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      // Adiciona informações do usuário ao request para uso nos controllers
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.isAdmin = decoded.isAdmin;

      return next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Erro na autenticação' });
  }
};

/* Middleware de Autorização de Administrador */
const adminMiddleware = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
