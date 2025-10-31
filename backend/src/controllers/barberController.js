const barberService = require('../services/barberService');

const barberController = {
  // Listar todos os barbeiros
  async getAll(req, res) {
    try {
      const barbers = await barberService.findAllActive();
      return res.status(200).json(barbers);
    } catch (error) {
      console.error('Erro ao listar barbeiros:', error);
      return res.status(500).json({ error: 'Erro ao listar barbeiros' });
    }
  },

  // Obter barbeiro por ID com suas especialidades
  async getById(req, res) {
    try {
      const { id } = req.params;

      // Validação de entrada
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const barber = await barberService.findByIdWithSpecialties(id);

      if (!barber) {
        return res.status(404).json({ error: 'Barbeiro não encontrado' });
      }

      return res.status(200).json(barber);
    } catch (error) {
      console.error('Erro ao obter barbeiro:', error);
      return res.status(500).json({ error: 'Erro ao obter barbeiro' });
    }
  },

  // Obter barbeiros por especialidade
  async getBySpecialty(req, res) {
    try {
      const { specialtyId } = req.params;

      // Validação de entrada
      if (!specialtyId || isNaN(specialtyId)) {
        return res.status(400).json({ error: 'ID de especialidade inválido' });
      }

      const barbers = await barberService.findBySpecialty(specialtyId);

      return res.status(200).json(barbers);
    } catch (error) {
      console.error('Erro ao buscar barbeiros por especialidade:', error);
      return res.status(500).json({ error: 'Erro ao buscar barbeiros' });
    }
  },

  // Criar novo barbeiro (apenas admin)
  async create(req, res) {
    try {
      const { name, age, hire_date, specialty_ids } = req.body;

      // Validação de entrada
      if (!name || !age || !hire_date) {
        return res.status(400).json({
          error: 'Nome, idade e data de contratação são obrigatórios'
        });
      }

      if (age < 18 || age > 100) {
        return res.status(400).json({ error: 'Idade inválida' });
      }

      const barber = await barberService.create(
        name.trim(),
        age,
        hire_date,
        specialty_ids
      );

      return res.status(201).json(barber);
    } catch (error) {
      console.error('Erro ao criar barbeiro:', error);
      return res.status(500).json({ error: 'Erro ao criar barbeiro' });
    }
  },

  // Atualizar barbeiro (apenas admin)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, age, hire_date, active } = req.body;

      // Validação de entrada
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      if (age && (age < 18 || age > 100)) {
        return res.status(400).json({ error: 'Idade inválida' });
      }

      const barber = await barberService.update(
        id,
        name?.trim(),
        age,
        hire_date,
        active
      );

      if (!barber) {
        return res.status(404).json({ error: 'Barbeiro não encontrado' });
      }

      return res.status(200).json(barber);
    } catch (error) {
      console.error('Erro ao atualizar barbeiro:', error);
      return res.status(500).json({ error: 'Erro ao atualizar barbeiro' });
    }
  },

  // Deletar barbeiro (apenas admin)
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Validação de entrada
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const barber = await barberService.delete(id);

      if (!barber) {
        return res.status(404).json({ error: 'Barbeiro não encontrado' });
      }

      return res.status(200).json({
        message: 'Barbeiro deletado com sucesso',
        barber
      });
    } catch (error) {
      // Erro de constraint (FK) - barbeiro tem agendamentos
      if (error.code === '23503') {
        return res.status(400).json({
          error: 'Não é possível deletar este barbeiro pois ele possui agendamentos'
        });
      }
      console.error('Erro ao deletar barbeiro:', error);
      return res.status(500).json({ error: 'Erro ao deletar barbeiro' });
    }
  },

  // Obter especialidades de um barbeiro (apenas admin)
  async getSpecialties(req, res) {
    try {
      const { id } = req.params;

      // Validação de entrada
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      // Verificar se o barbeiro existe
      const barber = await barberService.findById(id);
      if (!barber) {
        return res.status(404).json({ error: 'Barbeiro não encontrado' });
      }

      const specialties = await barberService.findBarberSpecialties(id);

      return res.status(200).json(specialties);
    } catch (error) {
      console.error('Erro ao obter especialidades do barbeiro:', error);
      return res.status(500).json({ error: 'Erro ao obter especialidades do barbeiro' });
    }
  },

  // Atualizar especialidades de um barbeiro (apenas admin)
  async updateSpecialties(req, res) {
    try {
      const { id } = req.params;
      const { specialty_ids } = req.body;

      // Validação de entrada
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      if (!Array.isArray(specialty_ids)) {
        return res.status(400).json({
          error: 'specialty_ids deve ser um array de IDs de especialidades'
        });
      }

      // Validar que todos os IDs são números
      const invalidIds = specialty_ids.filter(sid => isNaN(sid));
      if (invalidIds.length > 0) {
        return res.status(400).json({ error: 'IDs de especialidades inválidos' });
      }

      // Verificar se o barbeiro existe
      const barber = await barberService.findById(id);
      if (!barber) {
        return res.status(404).json({ error: 'Barbeiro não encontrado' });
      }

      // Validar se todas as especialidades existem
      if (specialty_ids.length > 0) {
        const allExist = await barberService.validateSpecialties(specialty_ids);
        if (!allExist) {
          return res.status(400).json({
            error: 'Uma ou mais especialidades não existem'
          });
        }
      }

      // Sincronizar especialidades
      const updatedSpecialties = await barberService.syncSpecialties(id, specialty_ids);

      return res.status(200).json({
        message: 'Especialidades atualizadas com sucesso',
        specialties: updatedSpecialties
      });
    } catch (error) {
      console.error('Erro ao atualizar especialidades do barbeiro:', error);
      return res.status(500).json({ error: 'Erro ao atualizar especialidades do barbeiro' });
    }
  },
};

module.exports = barberController;
