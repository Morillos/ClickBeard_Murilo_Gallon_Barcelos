/**
 * Componente: PrivateRoute
 *
 * Componente de proteção de rotas que controla acesso baseado em autenticação.
 *
 * Funcionalidades:
 * - Proteger rotas privadas (requer autenticação)
 * - Proteger rotas administrativas (requer ser admin)
 * - Redirecionar usuários não autenticados para login
 * - Redirecionar não-admins de rotas administrativas
 * - Exibir loading durante verificação de autenticação
 *
 * Props:
 * - children: Componente a ser renderizado se autorizado
 * - adminOnly: Boolean indicando se a rota é exclusiva para admins
 *
 * Hooks utilizados:
 * - useAuth: Acessa estado de autenticação e permissões
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Exibe loading enquanto verifica autenticação
  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  // Redireciona para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redireciona para dashboard se tentar acessar área admin sem permissão
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" />;
  }
  
  // Renderiza o componente filho se todas as verificações passarem
  return children;
};

export default PrivateRoute;
