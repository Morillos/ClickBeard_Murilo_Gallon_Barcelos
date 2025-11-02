/**
 * Componente: Dashboard
 *
 * Painel do cliente para visualização e gerenciamento de agendamentos.
 *
 * Funcionalidades:
 * - Listar todos os agendamentos do usuário
 * - Filtrar agendamentos por período (Hoje, Futuros, Todos)
 * - Filtrar apenas agendamentos com status "Agendado"
 * - Visualizar detalhes dos agendamentos (barbeiro, data, horário, status)
 * - Cancelar agendamentos com até 2 horas de antecedência
 * - Navegar para criação de novos agendamentos
 *
 * Hooks utilizados:
 * - useState: Gerencia estados locais (agendamentos, loading, erros, filtros)
 * - useEffect: Carrega agendamentos ao montar o componente
 * - useAuth: Acessa informações do usuário autenticado
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  // Estados principais
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Estados de filtro
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'future'
  const [showOnlyScheduled, setShowOnlyScheduled] = useState(false);

  // Carrega agendamentos ao montar componente
  useEffect(() => {
    loadAppointments();
  }, []);

  /**
   * Carrega todos os agendamentos do usuário
   */
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getUserAppointments();
      setAppointments(response.data);
    } catch (err) {
      setError('Erro ao carregar agendamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancela um agendamento específico
   */
  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Deseja realmente cancelar este agendamento?')) {
      return;
    }

    try {
      await appointmentAPI.cancel(appointmentId);
      alert('Agendamento cancelado com sucesso!');
      loadAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao cancelar agendamento');
    }
  };

  /**
   * Formata data no padrão brasileiro
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  /**
   * Formata horário removendo segundos
   */
  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  /**
   * Retorna label traduzida do status
   */
  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Agendado',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  /**
   * Retorna classe CSS do status
   */
  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  /**
   * Verifica se o agendamento pode ser cancelado
   * Regra: Apenas agendamentos com status 'scheduled' e com 2+ horas de antecedência
   */
  const canCancel = (appointment) => {
    if (appointment.status !== 'scheduled') return false;

    const dateOnly = appointment.appointment_date.split('T')[0];
    const appointmentDateTime = new Date(
      `${dateOnly}T${appointment.appointment_time}`
    );
    const now = new Date();
    const diffInHours = (appointmentDateTime - now) / (1000 * 60 * 60);

    return diffInHours >= 2;
  };

  /**
   * Verifica se o agendamento é de hoje
   */
  const isToday = (appointment) => {
    const today = new Date();
    const dateOnly = appointment.appointment_date.split('T')[0];
    const appointmentDate = new Date(dateOnly);
    
    return (
      appointmentDate.getUTCFullYear() === today.getFullYear() &&
      appointmentDate.getUTCMonth() === today.getMonth() &&
      appointmentDate.getUTCDate() === today.getDate()
    );
  };

  /**
   * Verifica se o agendamento é futuro (após hoje)
   */
  const isFuture = (appointment) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateOnly = appointment.appointment_date.split('T')[0];
    const appointmentDate = new Date(dateOnly);
    
    return appointmentDate > today;
  };

  /**
   * Filtra os agendamentos baseado nos filtros ativos
   */
  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Filtro por período
    if (activeFilter === 'today') {
      filtered = filtered.filter(isToday);
    } else if (activeFilter === 'future') {
      filtered = filtered.filter(isFuture);
    }

    // Filtro por status "Agendado"
    if (showOnlyScheduled) {
      filtered = filtered.filter(app => app.status === 'scheduled');
    }

    return filtered;
  };

  /**
   * Conta agendamentos por filtro
   */
  const getCountByFilter = (filter) => {
    let filtered = appointments;
    
    if (filter === 'today') {
      filtered = filtered.filter(isToday);
    } else if (filter === 'future') {
      filtered = filtered.filter(isFuture);
    }

    if (showOnlyScheduled) {
      filtered = filtered.filter(app => app.status === 'scheduled');
    }

    return filtered.length;
  };

  const filteredAppointments = getFilteredAppointments();

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Cabeçalho do dashboard */}
      <div className="dashboard-header">
        <h1>Meus Agendamentos</h1>
        <Link to="/appointments/new" className="btn btn-primary">
          Novo Agendamento
        </Link>
      </div>

      {/* Mensagem de erro */}
      {error && <div className="alert alert-error">{error}</div>}

      {appointments.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não tem agendamentos.</p>
          <Link to="/appointments/new" className="btn btn-primary">
            Fazer primeiro agendamento
          </Link>
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div className="filters-container">
            {/* Sub-abas de período */}
            <div className="sub-tabs">
              <button
                className={`sub-tab ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                Todos ({getCountByFilter('all')})
              </button>
              <button
                className={`sub-tab ${activeFilter === 'today' ? 'active' : ''}`}
                onClick={() => setActiveFilter('today')}
              >
                Hoje ({getCountByFilter('today')})
              </button>
              <button
                className={`sub-tab ${activeFilter === 'future' ? 'active' : ''}`}
                onClick={() => setActiveFilter('future')}
              >
                Futuros ({getCountByFilter('future')})
              </button>
            </div>

            {/* Checkbox para filtrar apenas agendados */}
            <div className="status-filter">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showOnlyScheduled}
                  onChange={(e) => setShowOnlyScheduled(e.target.checked)}
                />
                <span>Mostrar apenas agendados</span>
              </label>
            </div>
          </div>

          {/* Lista de agendamentos filtrados */}
          {filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum agendamento encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="appointments-list">
              {[...filteredAppointments].reverse().map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  {/* Cabeçalho do card com especialidade e status */}
                  <div className="appointment-header">
                    <h3>{appointment.specialty_name}</h3>
                    <span className={getStatusClass(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>

                  {/* Detalhes do agendamento */}
                  <div className="appointment-details">
                    <div className="appointment-info">
                      <strong>Barbeiro:</strong> {appointment.barber_name}
                    </div>
                    <div className="appointment-info">
                      <strong>Data:</strong> {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="appointment-info">
                      <strong>Horário:</strong> {formatTime(appointment.appointment_time)}
                    </div>
                  </div>

                  {/* Ações de cancelamento (se permitido) */}
                  {canCancel(appointment) && (
                    <div className="appointment-actions">
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        className="btn btn-danger"
                      >
                        Cancelar Agendamento
                      </button>
                      <p className="cancel-info">
                        Cancelamento disponível até 2 horas antes
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
