/**
 * Service de Autenticação
 *
 * Camada de Serviço (Service Layer):
 * - Contém toda a lógica de negócio relacionada à autenticação
 * - Isola a comunicação com o banco de dados
 * - Permite reutilização de código entre diferentes controllers
 * - Facilita testes unitários e manutenção
 *
 * Responsabilidades:
 * - Criação e validação de usuários
 * - Criptografia e verificação de senhas (bcrypt)
 * - Geração e validação de tokens JWT
 * - Busca de usuários no banco de dados
 *
 * Fluxo de Registro:
 * authController.register() -> authService.createUser() -> database
 *
 * Fluxo de Login:
 * authController.login() -> authService.findUserByEmail() -> authService.verifyPassword() -> authService.generateToken()
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
require("dotenv").config();

class AuthService {
  /**
   * Verifica se um email já está cadastrado no sistema
   */
  async emailExists(email) {
    const result = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows.length > 0;
  }

  /**
   * Cria um novo usuário no banco de dados
   */
  async createUser(name, email, password) {
    // Gera hash da senha com 10 rounds de salt (segurança vs performance)
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin, created_at",
      [name, email, hashedPassword]
    );

    return result.rows[0];
  }

  /**
   * Busca um usuário pelo email (inclui senha para validação de login)
   * */
  async findUserByEmail(email) {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  }

  /**
   * Busca um usuário pelo ID (sem retornar a senha)
   */
  async findUserById(id) {
    const result = await db.query(
      "SELECT id, name, email, is_admin, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  /**
   * Verifica se uma senha em texto plano corresponde ao hash armazenado
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Gera um token JWT para o usuário autenticado
   */
  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
  }

  /**
   * Formata os dados do usuário para resposta da API (remove senha e campos sensíveis)
   */
  formatUserResponse(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin,
    };
  }
}

module.exports = new AuthService();
