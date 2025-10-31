/**
 * ✅ Componente: AdminSpecialties
 *
 * Gerenciamento de especialidades (serviços) no painel administrativo.
 *
 * Funcionalidades:
 * - Listar todas as especialidades cadastradas
 * - Criar novas especialidades (nome e descrição)
 * - Editar especialidades existentes
 * - Excluir especialidades
 *
 * Hooks utilizados:
 * - useState: Gerencia estados locais (especialidades, formulários, edição)
 * - useEffect: Carrega especialidades ao montar o componente
 */

import { useState, useEffect } from 'react';
import { specialtyAPI } from '../services/api';

const AdminSpecialties = () => {
  // ✅ Estados principais
  const [specialties, setSpecialties] = useState([]);
  const [editingSpecialty, setEditingSpecialty] = useState(null);

  // ✅ Estados de controle
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSpecialtyForm, setShowSpecialtyForm] = useState(false);

  // ✅ Estado do formulário
  const [newSpecialty, setNewSpecialty] = useState({
    name: '',
    description: ''
  });

  // ✅ Carrega especialidades ao montar componente
  useEffect(() => {
    loadSpecialties();
  }, []);

  /**
   * ✅ Carrega todas as especialidades do backend
   */
  const loadSpecialties = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await specialtyAPI.getAll();
      setSpecialties(response.data);
    } catch (error) {
      console.error('Erro ao carregar especialidades:', error);
      setErrorMessage('Erro ao carregar especialidades');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Cria uma nova especialidade
   */
  const handleCreateSpecialty = async (e) => {
    e.preventDefault();

    try {
      setErrorMessage('');
      await specialtyAPI.create(newSpecialty);

      setSuccessMessage('Especialidade criada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);

      setNewSpecialty({ name: '', description: '' });
      setShowSpecialtyForm(false);
      loadSpecialties();
    } catch (error) {
      console.error('Erro ao criar especialidade:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao criar especialidade');
    }
  };

  /**
   * ✅ Inicia edição de uma especialidade
   */
  const handleStartEdit = (specialty) => {
    setEditingSpecialty({ ...specialty });
    setShowSpecialtyForm(false);
  };

  /**
   * ✅ Cancela edição
   */
  const handleCancelEdit = () => {
    setEditingSpecialty(null);
  };

  /**
   * ✅ Salva alterações da especialidade editada
   */
  const handleSaveEdit = async () => {
    if (!editingSpecialty) return;

    try {
      setErrorMessage('');
      await specialtyAPI.update(editingSpecialty.id, {
        name: editingSpecialty.name,
        description: editingSpecialty.description,
      });

      setSuccessMessage('Especialidade atualizada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);

      setEditingSpecialty(null);
      loadSpecialties();
    } catch (error) {
      console.error('Erro ao atualizar especialidade:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao atualizar especialidade');
    }
  };

  /**
   * ✅ Exclui uma especialidade
   */
  const handleDeleteSpecialty = async (specialtyId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta especialidade?')) {
      return;
    }

    try {
      setErrorMessage('');
      await specialtyAPI.delete(specialtyId);

      setSuccessMessage('Especialidade excluída com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);

      loadSpecialties();
    } catch (error) {
      console.error('Erro ao excluir especialidade:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao excluir especialidade');
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="admin-specialties">
      {/* ✅ Mensagens de feedback */}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="alert alert-error">{errorMessage}</div>
      )}

      <div className="specialties-container">
        <div className="section-header">
          <h2>Especialidades</h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setShowSpecialtyForm(!showSpecialtyForm);
              setEditingSpecialty(null);
            }}
          >
            {showSpecialtyForm ? 'Cancelar' : '+ Nova Especialidade'}
          </button>
        </div>

        {/* ✅ Formulário de criação de especialidade */}
        {showSpecialtyForm && (
          <form className="form-card" onSubmit={handleCreateSpecialty}>
            <div className="form-group">
              <label>Nome da Especialidade</label>
              <input
                type="text"
                placeholder="Ex: Corte de Cabelo"
                value={newSpecialty.name}
                onChange={(e) =>
                  setNewSpecialty({ ...newSpecialty, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Descrição (opcional)</label>
              <textarea
                placeholder="Descreva esta especialidade"
                value={newSpecialty.description}
                onChange={(e) =>
                  setNewSpecialty({ ...newSpecialty, description: e.target.value })
                }
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success btn-sm">
                Criar
              </button>
            </div>
          </form>
        )}

        {/* ✅ Lista de especialidades */}
        <div className="specialties-list">
          {specialties.length === 0 ? (
            <p className="empty-message">Nenhuma especialidade cadastrada</p>
          ) : (
            specialties.map((specialty) => (
              <div key={specialty.id} className="specialty-card">
                {editingSpecialty?.id === specialty.id ? (
                  /* ✅ Modo de edição */
                  <div className="specialty-edit">
                    <div className="form-group">
                      <label>Nome</label>
                      <input
                        type="text"
                        value={editingSpecialty.name}
                        onChange={(e) =>
                          setEditingSpecialty({
                            ...editingSpecialty,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Descrição</label>
                      <textarea
                        value={editingSpecialty.description || ''}
                        onChange={(e) =>
                          setEditingSpecialty({
                            ...editingSpecialty,
                            description: e.target.value,
                          })
                        }
                        rows="3"
                      />
                    </div>
                    <div className="specialty-actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={handleSaveEdit}
                      >
                        Salvar
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ✅ Modo de visualização */
                  <>
                    <div className="specialty-info">
                      <strong>{specialty.name}</strong>
                      {specialty.description && (
                        <p>{specialty.description}</p>
                      )}
                    </div>
                    <div className="specialty-actions">
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => handleStartEdit(specialty)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => handleDeleteSpecialty(specialty.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSpecialties;
