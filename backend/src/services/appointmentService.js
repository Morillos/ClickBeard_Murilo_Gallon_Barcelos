const db = require("../config/database");

class AppointmentService {
  /**
   * Gera todos os horários disponíveis (8h às 18h, intervalos de 30 minutos)
   */
  generateAllSlots() {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30:00`);
    }
    return slots;
  }

  /**
   * Busca horários já agendados para um barbeiro em uma data
   */
  async findBookedSlots(barberId, date) {
    const result = await db.query(
      `SELECT appointment_time FROM appointments
       WHERE barber_id = $1 AND appointment_date = $2 AND status = 'scheduled'`,
      [barberId, date]
    );
    return result.rows.map((row) => row.appointment_time);
  }

  /**
   * Retorna horários disponíveis para um barbeiro em uma data
   */
  async getAvailableSlots(barberId, date) {
    const allSlots = this.generateAllSlots();
    const bookedSlots = await this.findBookedSlots(barberId, date);

    return allSlots.filter((slot) => !bookedSlots.includes(slot));
  }

  /**
   * Verifica se um barbeiro tem uma especialidade
   */
  async barberHasSpecialty(barberId, specialtyId) {
    const result = await db.query(
      "SELECT * FROM barber_specialties WHERE barber_id = $1 AND specialty_id = $2",
      [barberId, specialtyId]
    );
    return result.rows.length > 0;
  }

  /**
   * Verifica se um horário está dentro do expediente
   */
  isWithinWorkingHours(appointmentTime) {
    const [hour] = appointmentTime.split(":");
    const hourInt = parseInt(hour);
    return hourInt >= 8 && hourInt < 18;
  }

  /**
   * Verifica se já existe agendamento no mesmo horário
   */
  async slotIsAvailable(barberId, date, time) {
    const result = await db.query(
      `SELECT * FROM appointments
       WHERE barber_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status = 'scheduled'`,
      [barberId, date, time]
    );
    return result.rows.length === 0;
  }

  /**
   * Verifica se a data/hora não é no passado
   */
  isInFuture(date, time) {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime > new Date();
  }

  /**
   * Cria um novo agendamento
   */
  async create(userId, barberId, specialtyId, date, time) {
    const result = await db.query(
      `INSERT INTO appointments (user_id, barber_id, specialty_id, appointment_date, appointment_time)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, barberId, specialtyId, date, time]
    );
    return result.rows[0];
  }

  /**
   * Busca agendamentos do usuário
   */
  async findByUserId(userId) {
    const result = await db.query(
      `SELECT
        a.*,
        b.name as barber_name,
        s.name as specialty_name,
        u.name as user_name
       FROM appointments a
       INNER JOIN barbers b ON a.barber_id = b.id
       INNER JOIN specialties s ON a.specialty_id = s.id
       INNER JOIN users u ON a.user_id = u.id
       WHERE a.user_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Busca todos os agendamentos com filtros opcionais
   */
  async findAll(filters = {}) {
    let query = `SELECT
        a.*,
        b.name as barber_name,
        s.name as specialty_name,
        u.name as user_name,
        u.email as user_email
       FROM appointments a
       INNER JOIN barbers b ON a.barber_id = b.id
       INNER JOIN specialties s ON a.specialty_id = s.id
       INNER JOIN users u ON a.user_id = u.id`;

    const conditions = [];
    const params = [];

    if (filters.date) {
      conditions.push(`a.appointment_date = $${params.length + 1}`);
      params.push(filters.date);
    }

    if (filters.status) {
      conditions.push(`a.status = $${params.length + 1}`);
      params.push(filters.status);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY a.appointment_date ASC, a.appointment_time ASC";

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Busca agendamentos do dia atual
   */
  async findToday() {
    const result = await db.query(
      `SELECT
        a.*,
        b.name as barber_name,
        s.name as specialty_name,
        u.name as user_name,
        u.email as user_email
       FROM appointments a
       INNER JOIN barbers b ON a.barber_id = b.id
       INNER JOIN specialties s ON a.specialty_id = s.id
       INNER JOIN users u ON a.user_id = u.id
       WHERE a.appointment_date = CURRENT_DATE AND a.status = 'scheduled'
       ORDER BY a.appointment_time ASC`
    );
    return result.rows;
  }

  /**
   * Busca agendamentos futuros
   */
  async findFuture() {
    const result = await db.query(
      `SELECT
        a.*,
        b.name as barber_name,
        s.name as specialty_name,
        u.name as user_name,
        u.email as user_email
       FROM appointments a
       INNER JOIN barbers b ON a.barber_id = b.id
       INNER JOIN specialties s ON a.specialty_id = s.id
       INNER JOIN users u ON a.user_id = u.id
       WHERE a.appointment_date > CURRENT_DATE AND a.status = 'scheduled'
       ORDER BY a.appointment_date ASC, a.appointment_time ASC`
    );
    return result.rows;
  }

  /**
   * Busca um agendamento por ID
   */
  async findById(id) {
    const result = await db.query("SELECT * FROM appointments WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  /**
   * Verifica se o usuário pode cancelar o agendamento (2 horas de antecedência)
   */
  async canUserCancel(appointment) {
    const { appointment_date } = appointment;

    if (!appointment_date) return false;

    // Cria o objeto Date diretamente (ISO é interpretado corretamente)
    const appointmentDateTime = new Date(appointment_date);
    const now = new Date();

    const diffMs = appointmentDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours >= 2;
  }

  /**
   * Cancela um agendamento
   */
  async cancel(id) {
    const result = await db.query(
      `UPDATE appointments SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Marca um agendamento como concluído
   */
  async complete(id) {
    const result = await db.query(
      `UPDATE appointments SET status = 'completed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'scheduled' RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new AppointmentService();
