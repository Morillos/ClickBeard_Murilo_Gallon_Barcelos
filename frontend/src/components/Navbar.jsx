/**
 * ✅ Componente: Navbar
 *
 * Barra de navegação principal do sistema.
 *
 * Comportamento dinâmico:
 * - Usuário não autenticado: Mostra Login e Cadastrar
 * - Cliente autenticado: Mostra Dashboard, Novo Agendamento e botão Sair
 * - Admin autenticado: Mostra APENAS Administração e botão Sair (sem opções de agendamento)
 *
 * Hooks utilizados:
 * - useAuth: Obtém informações do usuário logado e função de logout
 * - useNavigate: Redireciona para login após logout
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  /**
   * ✅ Faz logout e redireciona para login
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ✅ Logo do sistema */}
        {isAdmin() ? (
          // Admin: Apenas link para Administração
          <Link to="/admin" className="navbar-logo">
            ClickBeard
          </Link>
        ) : (
          // Cliente: Dashboard e Novo Agendamento
          <>
            <Link to="/" className="navbar-logo">
              ClickBeard
            </Link>
          </>
        )}

        <div className="navbar-menu">
          {user ? (
            <>
              {/* ✅ Renderiza links diferentes para admin e cliente */}
              {isAdmin() ? (
                // Admin: Apenas link para Administração
                <Link to="/admin" className="navbar-link">
                  Administração
                </Link>
              ) : (
                // Cliente: Dashboard e Novo Agendamento
                <>
                  <Link to="/dashboard" className="navbar-link">
                    Meus Agendamentos
                  </Link>
                  <Link to="/appointments/new" className="navbar-link">
                    Novo Agendamento
                  </Link>
                </>
              )}

              {/* ✅ Informações do usuário e botão de logout */}
              <div className="navbar-user">
                <span>{user.name}</span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Sair
                </button>
              </div>
            </>
          ) : (
            // Usuário não autenticado
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link">
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
