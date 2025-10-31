const db = require('../config/database');

class SpecialtyService {
  /**
   * Lista todas as especialidades
   */
  async findAll() {
    const result = await db.query('SELECT * FROM specialties ORDER BY name');
    return result.rows;
  }

  /**
   * Busca uma especialidade por ID
   */
  async findById(id) {
    const result = await db.query('SELECT * FROM specialties WHERE id = $1', [id]);
    return result.rows[0];
  }

  /**
   * Cria uma nova especialidade
   */
  async create(name, description) {
    const result = await db.query(
      'INSERT INTO specialties (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  }

  /**
   * Atualiza uma especialidade existente
   */
  async update(id, name, description) {
    const result = await db.query(
      'UPDATE specialties SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    return result.rows[0];
  }

  /**
   * Deleta uma especialidade
   */
  async delete(id) {
    const result = await db.query('DELETE FROM specialties WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  /**
   * Verifica se uma especialidade está sendo usada por barbeiros
   */
  async isUsedByBarbers(id) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM barber_specialties WHERE specialty_id = $1',
      [id]
    );
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Verifica se uma especialidade está sendo usada em agendamentos
   */
  async isUsedInAppointments(id) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM appointments WHERE specialty_id = $1',
      [id]
    );
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = new SpecialtyService();
