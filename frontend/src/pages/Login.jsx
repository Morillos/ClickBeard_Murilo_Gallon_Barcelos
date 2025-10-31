/**
 * Componente: Login
 *
 * Página de autenticação de usuários no sistema.
 *
 * Funcionalidades:
 * - Formulário de login com email e senha
 * - Validação de credenciais
 * - Redirecionamento baseado em tipo de usuário (admin/cliente)
 * - Exibição de mensagens de erro
 * - Link para página de cadastro
 *
 * Hooks utilizados:
 * - useState: Gerencia campos do formulário e estados de controle
 * - useAuth: Acessa função de login e contexto de autenticação
 * - useNavigate: Redireciona após login bem-sucedido
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  // Estados do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados de controle
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Processa o envio do formulário de login
   * Redireciona para área administrativa ou dashboard baseado no tipo de usuário
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

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
        <h1>Login</h1>
        <p className="auth-subtitle">Entre com sua conta ClickBeard</p>

        {/* Mensagem de erro */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Formulário de login */}
        <form onSubmit={handleSubmit}>
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
              placeholder="Sua senha"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Link para registro */}
        <div className="auth-footer">
          <p>
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
