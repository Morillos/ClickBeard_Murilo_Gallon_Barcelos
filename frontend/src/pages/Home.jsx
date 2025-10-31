import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="hero">
        <h1>Bem-vindo ao ClickBeard</h1>
        <p className="hero-subtitle">
          Sistema de agendamento para barbearias. Agende seu horário de forma
          rápida e prática!
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-primary">
                Meus Agendamentos
              </Link>
              <Link to="/appointments/new" className="btn btn-secondary">
                Novo Agendamento
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Começar Agora
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Já tenho conta
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>Agendamento Fácil</h3>
          <p>Escolha o barbeiro, serviço e horário em poucos cliques</p>
        </div>

        <div className="feature-card">
          <h3>Barbeiros Especializados</h3>
          <p>Profissionais qualificados em diversas especialidades</p>
        </div>

        <div className="feature-card">
          <h3>Flexibilidade</h3>
          <p>Cancele ou reagende com até 2 horas de antecedência</p>
        </div>

        <div className="feature-card">
          <h3>Horário Estendido</h3>
          <p>Atendimento todos os dias, das 8h às 18h</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
