-- ClickBeard Dados de Sementemento

-- Popular usuários de exemplo
INSERT INTO users (name, email, password, is_admin) VALUES
('Admin User', 'admin@clickbeard.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE),
('João Silva', 'joao@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', FALSE),
('Maria Santos', 'maria@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', FALSE),
('Pedro Costa', 'pedro@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', FALSE);

-- Popular barbeiros
INSERT INTO barbers (name, age, hire_date) VALUES
('Carlos Barbosa', 32, '2020-01-15'),
('Ricardo Alves', 28, '2021-05-20'),
('Fernando Lima', 35, '2019-03-10'),
('Marcos Souza', 30, '2022-02-01');

-- Popular especialidades
INSERT INTO specialties (name, description) VALUES
('Corte de Cabelo', 'Corte tradicional ou moderno'),
('Barba', 'Aparar e modelar barba'),
('Sobrancelha', 'Design de sobrancelha masculina'),
('Corte de Tesoura', 'Corte artesanal com tesoura'),
('Pigmentação', 'Pigmentação de barba e cabelo'),
('Platinado', 'Descoloração e platinado');

-- Associar especialidades aos barbeiros
-- Carlos: Corte, Barba, Sobrancelha
INSERT INTO barber_specialties (barber_id, specialty_id) VALUES
(1, 1), (1, 2), (1, 3);

-- Ricardo: Corte de Tesoura, Barba, Pigmentação
INSERT INTO barber_specialties (barber_id, specialty_id) VALUES
(2, 4), (2, 2), (2, 5);

-- Fernando: Corte, Barba, Platinado
INSERT INTO barber_specialties (barber_id, specialty_id) VALUES
(3, 1), (3, 2), (3, 6);

-- Marcos: Todos os serviços
INSERT INTO barber_specialties (barber_id, specialty_id) VALUES
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6);

-- Popular Agendamentos (próximos dias)
INSERT INTO appointments (user_id, barber_id, specialty_id, appointment_date, appointment_time, status) VALUES
(2, 1, 1, CURRENT_DATE, '09:00:00', 'scheduled'),
(3, 1, 2, CURRENT_DATE, '10:00:00', 'scheduled'),
(4, 2, 4, CURRENT_DATE, '11:30:00', 'scheduled'),
(2, 3, 1, CURRENT_DATE + INTERVAL '1 day', '14:00:00', 'scheduled'),
(3, 4, 3, CURRENT_DATE + INTERVAL '2 days', '15:30:00', 'scheduled');
