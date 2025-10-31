import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadAppointments();
  }, []);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Agendado',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

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

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Meus Agendamentos</h1>
        <Link to="/appointments/new" className="btn btn-primary">
          Novo Agendamento
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {appointments.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não tem agendamentos.</p>
          <Link to="/appointments/new" className="btn btn-primary">
            Fazer primeiro agendamento
          </Link>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <h3>{appointment.specialty_name}</h3>
                <span className={getStatusClass(appointment.status)}>
                  {getStatusLabel(appointment.status)}
                </span>
              </div>

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
    </div>
  );
};

export default Dashboard;
