/**
 * Componente: Register
 *
 * Página de cadastro de novos usuários no sistema.
 *
 * Funcionalidades:
 * - Formulário de registro com nome, email e senha
 * - Validação de senhas (mínimo 6 caracteres e confirmação)
 * - Criação de nova conta
 * - Redirecionamento baseado em tipo de usuário (admin/cliente)
 * - Exibição de mensagens de erro
 * - Link para página de login
 *
 * Hooks utilizados:
 * - useState: Gerencia campos do formulário e estados de controle
 * - useAuth: Acessa função de registro e contexto de autenticação
 * - useNavigate: Redireciona após registro bem-sucedido
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados de controle
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  /**
   * Processa o envio do formulário de registro
   * Valida senhas e cria nova conta
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validação: senhas devem coincidir
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    // Validação: senha mínima de 6 caracteres
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      // Redirecionar admin para /admin, cliente para /dashboard
      if (result.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Cadastro</h1>
        <p className="auth-subtitle">Crie sua conta ClickBeard</p>

        {/* Mensagem de erro */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Formulário de registro */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Seu nome"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirme sua senha"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {/* Link para login */}
        <div className="auth-footer">
          <p>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
