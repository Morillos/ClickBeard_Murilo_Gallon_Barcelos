const authService = require('../services/authService');

const authController = {
  // Registrar novo usuário
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validação de entrada
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
      }

      // Verificar se o email já existe (regra de negócio)
      const emailExists = await authService.emailExists(email);
      if (emailExists) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Criar usuário (lógica de negócio)
      const user = await authService.createUser(name, email, password);

      // Gerar token (lógica de negócio)
      const token = authService.generateToken(user);

      // Resposta HTTP
      return res.status(201).json({
        user: authService.formatUserResponse(user),
        token,
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  },

  // Login de usuário
  async login(req, res) {
    try {
      const { email, password } = req.body;


      // Validação de entrada
      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      // Buscar usuário (lógica de negócio)
      const user = await authService.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      // Verificar senha (lógica de negócio)
      const isValidPassword = await authService.verifyPassword(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }


      // Gerar token (lógica de negócio)
      const token = authService.generateToken(user);

      // Resposta HTTP
      return res.status(200).json({
        user: authService.formatUserResponse(user),
        token,
      });
    } catch (error) {
      console.error('[LOGIN] Erro no login:', error);
      return res.status(500).json({ error: 'Erro ao fazer login', details: error.message });
    }
  },

  // Obter perfil do usuário autenticado
  async getProfile(req, res) {
    try {
      // Buscar usuário (lógica de negócio)
      const user = await authService.findUserById(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Resposta HTTP
      return res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return res.status(500).json({ error: 'Erro ao obter perfil' });
    }
  },
};

module.exports = authController;
