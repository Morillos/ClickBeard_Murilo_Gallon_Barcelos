/**
 * ✅ Componente: AdminBarbers
 *
 * Gerenciamento de barbeiros no painel administrativo.
 *
 * Funcionalidades:
 * - Listar todos os barbeiros cadastrados
 * - Criar novos barbeiros (nome, idade, data de contratação)
 * - Excluir barbeiros existentes
 * - Selecionar barbeiro para gerenciar especialidades
 * - Atribuir/remover especialidades de um barbeiro
 *
 * Hooks utilizados:
 * - useState: Gerencia estados locais (barbeiros, especialidades, seleção, formulários)
 * - useEffect: Carrega dados ao montar o componente
 */

import { useState, useEffect } from 'react';
import { barberAPI, specialtyAPI } from '../services/api';

const AdminBarbers = () => {
  // ✅ Estados principais
  const [barbers, setBarbers] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState([]);

  // ✅ Estados de controle
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showBarberForm, setShowBarberForm] = useState(false);

  // ✅ Estado do formulário de novo barbeiro
  const [newBarber, setNewBarber] = useState({
    name: '',
    age: '',
    hire_date: ''
  });

  // ✅ Carrega dados iniciais ao montar componente
  useEffect(() => {
    loadData();
  }, []);

  /**
   * ✅ Carrega barbeiros e especialidades do backend
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const [barbersRes, specialtiesRes] = await Promise.all([
        barberAPI.getAll(),
        specialtyAPI.getAll(),
      ]);

      setBarbers(barbersRes.data);
      setSpecialties(specialtiesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrorMessage('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Seleciona um barbeiro e carrega suas especialidades
   */
  const handleSelectBarber = async (barber) => {
    try {
      setSelectedBarber(barber);
      setErrorMessage('');

      // Busca especialidades do barbeiro selecionado
      const response = await barberAPI.getSpecialties(barber.id);
      setSelectedSpecialtyIds(response.data.map((s) => s.id));
    } catch (error) {
      console.error('Erro ao carregar especialidades do barbeiro:', error);
      setErrorMessage('Erro ao carregar especialidades do barbeiro');
    }
  };

  /**
   * ✅ Adiciona ou remove uma especialidade da seleção
   */
  const handleToggleSpecialty = (specialtyId) => {
    setSelectedSpecialtyIds((prev) => {
      if (prev.includes(specialtyId)) {
        return prev.filter((id) => id !== specialtyId);
      } else {
        return [...prev, specialtyId];
      }
    });
  };

  /**
   * ✅ Salva as especialidades do barbeiro no backend
   */
  const handleSaveBarberSpecialties = async () => {
    if (!selectedBarber) return;

    try {
      setErrorMessage('');
      await barberAPI.updateSpecialties(selectedBarber.id, selectedSpecialtyIds);

      setSuccessMessage('Especialidades atualizadas com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Recarrega especialidades do barbeiro
      const response = await barberAPI.getSpecialties(selectedBarber.id);
      setSelectedSpecialtyIds(response.data.map((s) => s.id));
    } catch (error) {
      console.error('Erro ao salvar especialidades:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao salvar especialidades');
    }
  };

  /**
   * ✅ Cria um novo barbeiro
   */
  const handleCreateBarber = async (e) => {
    e.preventDefault();

    try {
      setErrorMessage('');
      await barberAPI.create(newBarber);

      setSuccessMessage('Barbeiro criado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);

      setNewBarber({ name: '', age: '', hire_date: '' });
      setShowBarberForm(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar barbeiro:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao criar barbeiro');
    }
  };

  /**
   * ✅ Exclui um barbeiro
   */
  const handleDeleteBarber = async (barberId) => {
    if (!window.confirm('Tem certeza que deseja excluir este barbeiro?')) {
      return;
    }

    try {
      setErrorMessage('');
      await barberAPI.delete(barberId);

      setSuccessMessage('Barbeiro excluído com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Se o barbeiro excluído estava selecionado, limpa a seleção
      if (selectedBarber?.id === barberId) {
        setSelectedBarber(null);
        setSelectedSpecialtyIds([]);
      }

      loadData();
    } catch (error) {
      console.error('Erro ao excluir barbeiro:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao excluir barbeiro');
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="admin-barbers">
      {/* ✅ Mensagens de feedback */}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="alert alert-error">{errorMessage}</div>
      )}

      <div className="barbers-grid">
        {/* ✅ Coluna 1: Lista de Barbeiros */}
        <div className="barbers-section">
          <div className="section-header">
            <h2>Barbeiros</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowBarberForm(!showBarberForm)}
            >
              {showBarberForm ? 'Cancelar' : '+ Novo Barbeiro'}
            </button>
          </div>

          {/* ✅ Formulário de criação de barbeiro */}
          {showBarberForm && (
            <form className="form-card" onSubmit={handleCreateBarber}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nome"
                  value={newBarber.name}
                  onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Idade"
                  value={newBarber.age}
                  onChange={(e) => setNewBarber({ ...newBarber, age: e.target.value })}
                  required
                  min="18"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>Data de Contratação</label>
                <input
                  type="date"
                  value={newBarber.hire_date}
                  onChange={(e) => setNewBarber({ ...newBarber, hire_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success btn-sm">
                  Criar
                </button>
              </div>
            </form>
          )}

          {/* ✅ Lista de barbeiros */}
          <div className="items-list">
            {barbers.length === 0 ? (
              <p className="empty-message">Nenhum barbeiro cadastrado</p>
            ) : (
              barbers.map((barber) => (
                <div
                  key={barber.id}
                  className={`item-card ${selectedBarber?.id === barber.id ? 'selected' : ''}`}
                  onClick={() => handleSelectBarber(barber)}
                >
                  <div className="item-info">
                    <strong>{barber.name}</strong>
                    <span>{barber.age} anos</span>
                  </div>
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBarber(barber.id);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ Coluna 2: Especialidades do Barbeiro Selecionado */}
        <div className="specialties-section">
          <div className="section-header">
            <h2>
              {selectedBarber
                ? `Especialidades de ${selectedBarber.name}`
                : 'Selecione um barbeiro'}
            </h2>
          </div>

          {selectedBarber ? (
            <div className="specialties-selector">
              {specialties.length === 0 ? (
                <p className="empty-message">Nenhuma especialidade cadastrada</p>
              ) : (
                <>
                  {/* ✅ Lista de checkboxes para especialidades */}
                  <div className="checkbox-list">
                    {specialties.map((specialty) => (
                      <label key={specialty.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedSpecialtyIds.includes(specialty.id)}
                          onChange={() => handleToggleSpecialty(specialty.id)}
                        />
                        <div className="checkbox-content">
                          <strong>{specialty.name}</strong>
                          {specialty.description && <span>{specialty.description}</span>}
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* ✅ Botão para salvar */}
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveBarberSpecialties}
                  >
                    Salvar Especialidades
                  </button>
                </>
              )}
            </div>
          ) : (
            <p className="empty-message">
              Selecione um barbeiro na coluna da esquerda para gerenciar suas especialidades.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBarbers;
