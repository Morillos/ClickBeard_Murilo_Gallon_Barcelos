import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  specialtyAPI,
  barberAPI,
  appointmentAPI,
} from '../services/api';

const NewAppointment = () => {
  const [specialties, setSpecialties] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadSpecialties();
  }, []);

  useEffect(() => {
    if (selectedSpecialty) {
      loadBarbersBySpecialty(selectedSpecialty);
      setSelectedBarber('');
      setSelectedDate('');
      setSelectedTime('');
      setAvailableSlots([]);
    }
  }, [selectedSpecialty]);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      loadAvailableSlots(selectedBarber, selectedDate);
      setSelectedTime('');
    }
  }, [selectedBarber, selectedDate]);

  const loadSpecialties = async () => {
    try {
      const response = await specialtyAPI.getAll();
      setSpecialties(response.data);
    } catch (err) {
      setError('Erro ao carregar especialidades');
      console.error(err);
    }
  };

  const loadBarbersBySpecialty = async (specialtyId) => {
    try {
      const response = await barberAPI.getBySpecialty(specialtyId);
      setBarbers(response.data);
    } catch (err) {
      setError('Erro ao carregar barbeiros');
      console.error(err);
    }
  };

  const loadAvailableSlots = async (barberId, date) => {
    try {
      const response = await appointmentAPI.getAvailableSlots(barberId, date);
      setAvailableSlots(response.data);
    } catch (err) {
      setError('Erro ao carregar horários disponíveis');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await appointmentAPI.create({
        barber_id: parseInt(selectedBarber),
        specialty_id: parseInt(selectedSpecialty),
        appointment_date: selectedDate,
        appointment_time: selectedTime,
      });

      alert('Agendamento realizado com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };


  return (
    <div className="appointment-container">
      <div className="appointment-card">
        <h1>Novo Agendamento</h1>
        <p className="appointment-subtitle">
          Escolha o serviço, barbeiro e horário desejado
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Especialidade */}
          <div className="form-group">
            <label htmlFor="specialty">Especialidade</label>
            <select
              id="specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              required
            >
              <option value="">Selecione uma especialidade</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>

          {/* Barbeiro */}
          {selectedSpecialty && (
            <div className="form-group">
              <label htmlFor="barber">Barbeiro</label>
              <select
                id="barber"
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                required
              >
                <option value="">Selecione um barbeiro</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
              {barbers.length === 0 && (
                <p className="form-hint">
                  Nenhum barbeiro disponível para esta especialidade
                </p>
              )}
            </div>
          )}

          {/* Data */}
          {selectedBarber && (
            <div className="form-group">
              <label htmlFor="date">Data</label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                required
              />
            </div>
          )}

          {/* Horário */}
          {selectedDate && (
            <div className="form-group">
              <label htmlFor="time">Horário</label>
              {availableSlots.length > 0 ? (
                <div className="time-slots">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot ${
                        selectedTime === slot ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot.substring(0, 5)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="form-hint">
                  Nenhum horário disponível para esta data
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          {selectedTime && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewAppointment;
