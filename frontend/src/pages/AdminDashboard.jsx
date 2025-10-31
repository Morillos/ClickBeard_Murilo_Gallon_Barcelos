/**
 * Componente: AdminDashboard
 *
 * Painel administrativo principal com navegação por abas.
 *
 * Abas disponíveis:
 * 1. Agendamentos - Visualizar e gerenciar agendamentos (hoje e futuros)
 * 2. Barbeiros - Gerenciar barbeiros e suas especialidades
 * 3. Especialidades - Gerenciar especialidades/serviços oferecidos
 *
 * Hooks utilizados:
 * - useState: Controla aba ativa, sub-abas e estados dos agendamentos
 * - useEffect: Carrega agendamentos quando a aba de agendamentos é ativada
 *
 * Carregamento lazy: Dados são carregados apenas quando necessário
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import AdminBarbers from './AdminBarbers';
import AdminSpecialties from './AdminSpecialties';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Controle de abas principais
  const [activeTab, setActiveTab] = useState('appointments');
  const [activeSubTab, setActiveSubTab] = useState('today');

  // Estados para agendamentos
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [futureAppointments, setFutureAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carrega agendamentos apenas quando a aba appointments está ativa
  useEffect(() => {
    if (activeTab === 'appointments') {
      loadAppointments();
    }
  }, [activeTab]);

  /**
   * Carrega agendamentos do dia e futuros em paralelo
   */
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const [todayResponse, futureResponse] = await Promise.all([
        appointmentAPI.getTodayAppointments(),
        appointmentAPI.getFutureAppointments(),
      ]);

      setTodayAppointments(todayResponse.data);
      setFutureAppointments(futureResponse.data);
    } catch (err) {
      setError('Erro ao carregar agendamentos');
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Marca um agendamento como concluído
   */
  const handleComplete = async (appointmentId) => {
    if (!window.confirm('Marcar este agendamento como concluído?')) {
      return;
    }

    try {
      await appointmentAPI.complete(appointmentId);
      alert('Agendamento marcado como concluído!');
      loadAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao completar agendamento');
    }
  };

  /**
   * Cancela um agendamento
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
   * Formata data para padrão brasileiro (dd/mm/aaaa)
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  /**
   * Formata hora removendo segundos (HH:MM)
   */
  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  /**
   * Retorna label traduzido do status
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
   * Retorna classe CSS baseada no status
   */
  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  /**
   * Renderiza o conteúdo da aba de agendamentos
   */
  const renderAppointmentsContent = () => {
    if (loading) {
      return <div className="loading">Carregando...</div>;
    }

    return (
      <div className="appointments-container">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Sub-abas: Hoje / Futuros */}
        <div className="sub-tabs">
          <button
            className={`sub-tab ${activeSubTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('today')}
          >
            Hoje ({todayAppointments.length})
          </button>
          <button
            className={`sub-tab ${activeSubTab === 'future' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('future')}
          >
            Futuros ({futureAppointments.length})
          </button>
        </div>

        <div className="appointments-content">
          {/* Sub-aba: Agendamentos de Hoje */}
          {activeSubTab === 'today' && (
            <div className="appointments-section">
              <h2>Agendamentos de Hoje</h2>
              {todayAppointments.length === 0 ? (
                <p className="empty-message">Nenhum agendamento para hoje</p>
              ) : (
                <div className="appointments-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Horário</th>
                        <th>Cliente</th>
                        <th>Email</th>
                        <th>Barbeiro</th>
                        <th>Serviço</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{formatTime(appointment.appointment_time)}</td>
                          <td>{appointment.user_name}</td>
                          <td>{appointment.user_email}</td>
                          <td>{appointment.barber_name}</td>
                          <td>{appointment.specialty_name}</td>
                          <td>
                            <span className={getStatusClass(appointment.status)}>
                              {getStatusLabel(appointment.status)}
                            </span>
                          </td>
                          <td>
                            {appointment.status === 'scheduled' && (
                              <div className="action-buttons">
                                <button
                                  onClick={() => handleComplete(appointment.id)}
                                  className="btn btn-sm btn-success"
                                >
                                  Concluir
                                </button>
                                <button
                                  onClick={() => handleCancel(appointment.id)}
                                  className="btn btn-sm btn-danger"
                                >
                                  Cancelar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sub-aba: Agendamentos Futuros */}
          {activeSubTab === 'future' && (
            <div className="appointments-section">
              <h2>Agendamentos Futuros</h2>
              {futureAppointments.length === 0 ? (
                <p className="empty-message">Nenhum agendamento futuro</p>
              ) : (
                <div className="appointments-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Cliente</th>
                        <th>Email</th>
                        <th>Barbeiro</th>
                        <th>Serviço</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {futureAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{formatDate(appointment.appointment_date)}</td>
                          <td>{formatTime(appointment.appointment_time)}</td>
                          <td>{appointment.user_name}</td>
                          <td>{appointment.user_email}</td>
                          <td>{appointment.barber_name}</td>
                          <td>{appointment.specialty_name}</td>
                          <td>
                            <span className={getStatusClass(appointment.status)}>
                              {getStatusLabel(appointment.status)}
                            </span>
                          </td>
                          <td>
                            {appointment.status === 'scheduled' && (
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="btn btn-sm btn-danger"
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <h1>Painel Administrativo</h1>

      {/* Abas principais: Agendamentos | Barbeiros | Especialidades */}
      <div className="main-tabs">
        <button
          className={`main-tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Agendamentos
        </button>
        <button
          className={`main-tab ${activeTab === 'barbers' ? 'active' : ''}`}
          onClick={() => setActiveTab('barbers')}
        >
          Barbeiros
        </button>
        <button
          className={`main-tab ${activeTab === 'specialties' ? 'active' : ''}`}
          onClick={() => setActiveTab('specialties')}
        >
          Especialidades
        </button>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="tab-content">
        {activeTab === 'appointments' && renderAppointmentsContent()}
        {activeTab === 'barbers' && <AdminBarbers />}
        {activeTab === 'specialties' && <AdminSpecialties />}
      </div>
    </div>
  );
};

export default AdminDashboard;
