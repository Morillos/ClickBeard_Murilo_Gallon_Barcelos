const db = require('../config/database');

class BarberService {
  /**
   * Lista todos os barbeiros ativos
   *
   * @returns {Promise<Array>} Array de barbeiros ativos ordenados por nome
   */
  async findAllActive() {
    const result = await db.query(
      'SELECT * FROM barbers WHERE active = TRUE ORDER BY name'
    );
    return result.rows;
  }

  /**
   * Lista todos os barbeiros (incluindo inativos)
   */
  async findAll() {
    const result = await db.query('SELECT * FROM barbers ORDER BY name');
    return result.rows;
  }

  /**
   * Busca um barbeiro por ID
   */
  async findById(id) {
    const result = await db.query('SELECT * FROM barbers WHERE id = $1', [id]);
    return result.rows[0];
  }

  /**
   * Busca as especialidades de um barbeiro
   */
  async findBarberSpecialties(barberId) {
    const result = await db.query(
      `SELECT s.* FROM specialties s
       INNER JOIN barber_specialties bs ON s.id = bs.specialty_id
       WHERE bs.barber_id = $1
       ORDER BY s.name`,
      [barberId]
    );
    return result.rows;
  }

  /**
   * Busca um barbeiro com suas especialidades
   */
  async findByIdWithSpecialties(id) {
    const barber = await this.findById(id);
    if (!barber) return null;

    const specialties = await this.findBarberSpecialties(id);
    return {
      ...barber,
      specialties,
    };
  }

  /**
   * Busca barbeiros por especialidade
   */
  async findBySpecialty(specialtyId) {
    const result = await db.query(
      `SELECT DISTINCT b.* FROM barbers b
       INNER JOIN barber_specialties bs ON b.id = bs.barber_id
       WHERE bs.specialty_id = $1 AND b.active = TRUE
       ORDER BY b.name`,
      [specialtyId]
    );
    return result.rows;
  }

  /**
   * Cria um novo barbeiro
   */
  async create(name, age, hireDate, specialtyIds = []) {
    // Inicia transação usando o pool
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Insere o barbeiro
      const barberResult = await client.query(
        'INSERT INTO barbers (name, age, hire_date) VALUES ($1, $2, $3) RETURNING *',
        [name, age, hireDate]
      );

      const barber = barberResult.rows[0];

      // Associa especialidades se fornecidas
      if (specialtyIds && Array.isArray(specialtyIds) && specialtyIds.length > 0) {
        const values = specialtyIds
          .map((sid, idx) => `($1, $${idx + 2})`)
          .join(',');

        await client.query(
          `INSERT INTO barber_specialties (barber_id, specialty_id) VALUES ${values}`,
          [barber.id, ...specialtyIds]
        );
      }

      await client.query('COMMIT');
      return barber;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Atualiza um barbeiro
   */
  async update(id, name, age, hireDate, active) {
    const result = await db.query(
      'UPDATE barbers SET name = COALESCE($1, name), age = COALESCE($2, age), hire_date = COALESCE($3, hire_date), active = COALESCE($4, active) WHERE id = $5 RETURNING *',
      [name, age, hireDate, active, id]
    );
    return result.rows[0];
  }

  /**
   * Deleta um barbeiro
   */
  async delete(id) {
    const result = await db.query('DELETE FROM barbers WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  /**
   * Adiciona especialidades a um barbeiro
   */
  async addSpecialties(barberId, specialtyIds) {
    if (!specialtyIds || !Array.isArray(specialtyIds) || specialtyIds.length === 0) {
      return;
    }

    const values = specialtyIds
      .map((sid, idx) => `($1, $${idx + 2})`)
      .join(',');

    await db.query(
      `INSERT INTO barber_specialties (barber_id, specialty_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      [barberId, ...specialtyIds]
    );
  }

  /**
   * Remove especialidades de um barbeiro
   */
  async removeSpecialties(barberId, specialtyIds) {
    if (!specialtyIds || !Array.isArray(specialtyIds) || specialtyIds.length === 0) {
      return;
    }

    const placeholders = specialtyIds.map((_, idx) => `$${idx + 2}`).join(',');
    await db.query(
      `DELETE FROM barber_specialties WHERE barber_id = $1 AND specialty_id IN (${placeholders})`,
      [barberId, ...specialtyIds]
    );
  }

  /**
   * Sincroniza especialidades de um barbeiro (substitui todas)
   */
  async syncSpecialties(barberId, specialtyIds) {
    // Obtém uma conexão dedicada do pool para a transação
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Remove todas as especialidades atuais do barbeiro
      await client.query(
        'DELETE FROM barber_specialties WHERE barber_id = $1',
        [barberId]
      );

      // Adiciona as novas especialidades se fornecidas
      if (specialtyIds && Array.isArray(specialtyIds) && specialtyIds.length > 0) {
        // Remove duplicatas usando Set (caso o frontend envie IDs repetidos)
        const uniqueIds = [...new Set(specialtyIds)];

        // Constrói query dinâmica: VALUES ($1, $2), ($1, $3), ($1, $4)...
        const values = uniqueIds
          .map((sid, idx) => `($1, $${idx + 2})`)
          .join(',');

        await client.query(
          `INSERT INTO barber_specialties (barber_id, specialty_id) VALUES ${values}`,
          [barberId, ...uniqueIds]
        );
      }

      // Confirma a transação (torna as mudanças permanentes)
      await client.query('COMMIT');

      // Retorna as especialidades atualizadas
      return await this.findBarberSpecialties(barberId);
    } catch (error) {
      // Se houver qualquer erro, desfaz TODAS as mudanças
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // SEMPRE libera a conexão de volta ao pool
      client.release();
    }
  }

  /**
   * Valida se todas as especialidades existem
   */
  async validateSpecialties(specialtyIds) {
    if (!specialtyIds || specialtyIds.length === 0) {
      return true;
    }

    const placeholders = specialtyIds.map((_, idx) => `$${idx + 1}`).join(',');
    const result = await db.query(
      `SELECT COUNT(*) as count FROM specialties WHERE id IN (${placeholders})`,
      specialtyIds
    );

    return parseInt(result.rows[0].count) === specialtyIds.length;
  }

  /**
   * Verifica se um barbeiro tem agendamentos
   */
  async hasAppointments(id) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM appointments WHERE barber_id = $1',
      [id]
    );
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = new BarberService();
