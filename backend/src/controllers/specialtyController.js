const specialtyService = require('../services/specialtyService');

const specialtyController = {
  // Listar todas as especialidades
  async getAll(req, res) {
    try {
      const specialties = await specialtyService.findAll();
      return res.status(200).json(specialties);
    } catch (error) {
      console.error('Erro ao listar especialidades:', error);
      return res.status(500).json({ error: 'Erro ao listar especialidades' });
    }
  },

  // Obter especialidade por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      // Validação de entrada
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const specialty = await specialtyService.findById(id);

      if (!specialty) {
        return res.status(404).json({ error: 'Especialidade não encontrada' });
      }

      return res.status(200).json(specialty);
    } catch (error) {
      console.error('Erro ao obter especialidade:', error);
      return res.status(500).json({ error: 'Erro ao obter especialidade' });
    }
  },

  // Criar nova especialidade (apenas admin)
  async create(req, res) {
    try {
      const { name, description } = req.body;

      // Validação de entrada
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const specialty = await specialtyService.create(name.trim(), description?.trim());

      return res.status(201).json(specialty);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Especialidade já existe' });
      }
      console.error('Erro ao criar especialidade:', error);
      return res.status(500).json({ error: 'Erro ao criar especialidade' });
    }
  },

  // Atualizar especialidade (apenas admin)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // Validação de entrada
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      if (!name && !description) {
        return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido' });
      }

      const specialty = await specialtyService.update(
        id,
        name?.trim(),
        description?.trim()
      );

      if (!specialty) {
        return res.status(404).json({ error: 'Especialidade não encontrada' });
      }

      return res.status(200).json(specialty);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Especialidade já existe' });
      }
      console.error('Erro ao atualizar especialidade:', error);
      return res.status(500).json({ error: 'Erro ao atualizar especialidade' });
    }
  },

  // Deletar especialidade (apenas admin)
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Validação de entrada
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const specialty = await specialtyService.delete(id);

      if (!specialty) {
        return res.status(404).json({ error: 'Especialidade não encontrada' });
      }

      return res.status(200).json({
        message: 'Especialidade deletada com sucesso',
        specialty
      });
    } catch (error) {
      // Erro de constraint (FK) - especialidade em uso
      if (error.code === '23503') {
        return res.status(400).json({
          error: 'Não é possível deletar esta especialidade pois ela está sendo utilizada'
        });
      }
      console.error('Erro ao deletar especialidade:', error);
      return res.status(500).json({ error: 'Erro ao deletar especialidade' });
    }
  },
};

module.exports = specialtyController;
