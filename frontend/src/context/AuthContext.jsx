/**
 * Context: AuthContext
 *
 * Gerenciamento global de autenticação da aplicação.
 *
 * Funcionalidades:
 * - Armazenar estado do usuário autenticado
 * - Login e registro de usuários
 * - Logout e limpeza de sessão
 * - Verificação de permissões (admin/cliente)
 * - Persistência de autenticação via localStorage
 * - Hook useAuth para acesso ao contexto
 *
 * Hooks utilizados:
 * - useState: Gerencia estado do usuário e loading
 * - useEffect: Restaura sessão ao carregar aplicação
 * - useContext: Disponibiliza contexto para componentes filhos
 */

import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

/**
 * Hook customizado para acessar o contexto de autenticação
 * Lança erro se usado fora do AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro do AuthProvider');
  }
  return context;
};

/**
 * Provider do contexto de autenticação
 * Envolve a aplicação e disponibiliza funções e estado de auth
 */
export const AuthProvider = ({ children }) => {
  // Estados principais
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Restaura sessão do usuário ao carregar a aplicação
   * Verifica localStorage por token e dados do usuário
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login do usuário
   * Retorna o objeto user no resultado para permitir redirecionamento
   * baseado no papel (admin vs cliente)
   */
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;

      // Persiste dados no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login',
      };
    }
  };

  /**
   * Registro de novo usuário
   * Retorna o objeto user no resultado para permitir redirecionamento
   * baseado no papel (admin vs cliente)
   */
  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password });
      const { user, token } = response.data;

      // Persiste dados no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao registrar',
      };
    }
  };

  /**
   * Logout do usuário
   * Remove token e dados do localStorage
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /**
   * Verifica se o usuário atual é administrador
   */
  const isAdmin = () => {
    return user?.isAdmin || false;
  };

  // Valor do contexto disponibilizado aos componentes
  const value = {
    user,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
