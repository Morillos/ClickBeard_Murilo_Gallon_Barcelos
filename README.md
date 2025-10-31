# ClickBeard - Sistema de Agendamento para Barbearia

Sistema completo de agendamento online para barbearias, desenvolvido com Node.js, React e PostgreSQL.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Diagrama ER](#diagrama-er)
- [Usuários de Teste](#usuários-de-teste)
- [Regras de Negócio](#regras-de-negócio)

## Sobre o Projeto

O ClickBeard é um sistema web que permite aos clientes agendar serviços em uma barbearia de forma prática e intuitiva. O sistema oferece:

- Cadastro e autenticação de clientes
- Seleção de especialidades e barbeiros
- Agendamento de horários disponíveis
- Visualização e cancelamento de agendamentos
- Painel administrativo para gerenciar agendamentos

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **bcrypt** - Criptografia de senhas
- **pg** - Cliente PostgreSQL para Node.js

### Frontend
- **React** - Biblioteca para interfaces
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **Axios** - Cliente HTTP

## Arquitetura do Sistema

### Backend - Padrão de Camadas (Layered Architecture)

O backend segue uma arquitetura em camadas para separar responsabilidades:

```
┌─────────────────────────────────────────┐
│           CLIENT (Frontend)              │
└─────────────────┬───────────────────────┘
                  │ HTTP Request
                  ▼
┌─────────────────────────────────────────┐
│         ROUTES (authRoutes.js)          │  ← Define endpoints
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      MIDDLEWARES (auth.js)              │  ← Valida JWT, verifica admin
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    CONTROLLERS (authController.js)      │  ← Valida entrada, chama service
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     SERVICES (authService.js)           │  ← Lógica de negócio
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       DATABASE (PostgreSQL)             │  ← Persistência
└─────────────────────────────────────────┘
```

**Responsabilidades de cada camada:**

1. **Routes**: Define os endpoints da API e aplica middlewares
2. **Middlewares**: Autenticação JWT, autorização de admin, validações
3. **Controllers**: Validação de entrada, tratamento de erros HTTP, formatação de resposta
4. **Services**: Lógica de negócio, comunicação com banco, transações
5. **Database**: Pool de conexões PostgreSQL, queries preparadas

**Exemplo de fluxo (Login):**
```
POST /api/auth/login
  → authRoutes.js
  → authController.login()
    → authService.findUserByEmail()
    → authService.verifyPassword()
    → authService.generateToken()
  ← Resposta: { user, token }
```

### Frontend - Arquitetura de Componentes

```
src/
├── components/       # Componentes reutilizáveis (Navbar, PrivateRoute)
├── context/         # Context API para estado global (AuthContext)
├── pages/           # Páginas completas (Dashboard, AdminDashboard)
├── services/        # API client (Axios configurado)
└── App.jsx          # Configuração de rotas
```

## Pré-requisitos

Antes de começar, você precisará ter instalado:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (versão 12 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Morillos/ClickBeard_Murilo_Gallon_Barcelos.git
cd clickbeard
```

### 2. Instale as dependências do backend

```bash
cd backend
npm install
```

### 3. Instale as dependências do frontend

```bash
cd ../frontend
npm install
```

## Configuração do Banco de Dados

### 1. Crie o banco de dados PostgreSQL

```bash
# Conecte-se ao PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE clickbeard;

# Saia do psql
\q
```

### 2. Execute o script de criação das tabelas
(na raiz do projeto)
```bash
psql -U postgres -d clickbeard -f database/schema.sql
```

### 3. Popule o banco com dados de exemplo
(na raiz do projeto)
```bash
psql -U postgres -d clickbeard -f database/seed.sql
```

### 4. Configure as variáveis de ambiente do backend

Crie um arquivo `.env` na pasta `backend/` baseado no `.env.example`:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clickbeard
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# JWT Configuration
JWT_SECRET=seu_secret_jwt_aqui_mude_em_producao
JWT_EXPIRES_IN=7d
```

### 5. Configure as variáveis de ambiente do frontend

Crie um arquivo `.env` na pasta `frontend/` baseado no `.env.example`:

```bash
cd ../frontend
cp .env.example .env
```

Edite o arquivo `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Executando o Projeto

Você precisará de dois terminais abertos:

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

O backend estará rodando em: `http://localhost:5000`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

O frontend estará rodando em: `http://localhost:3000`

### - Resolução das Hash para Login
Para conseguir fazer login com os usuários de teste, execute o script de reset de senhas.
Necessário para renovação das hash's.

```bash
cd backend
node reset-passwords.js
```
**Senha para todos os usuários: password123**

## Estrutura do Projeto

```
ClickBeard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Configuração do PostgreSQL
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login e registro
│   │   │   ├── barberController.js  # Gestão de barbeiros
│   │   │   ├── specialtyController.js # Gestão de especialidades
│   │   │   └── appointmentController.js # Gestão de agendamentos
│   │   ├── middleware/
│   │   │   └── auth.js              # Middleware de autenticação JWT
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── barberRoutes.js
│   │   │   ├── specialtyRoutes.js
│   │   │   └── appointmentRoutes.js
│   │   └── server.js                # Configuração do Express
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Context de autenticação
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx        # Painel do cliente
│   │   │   ├── NewAppointment.jsx   # Criar agendamento
│   │   │   └── Admin.jsx            # Painel administrativo
│   │   ├── services/
│   │   │   └── api.js               # Configuração Axios
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
├── database/
│   ├── schema.sql                   # Script de criação das tabelas
│   └── seed.sql                     # Dados de exemplo
├── docs/
│   └── diagrama-er.md               # Diagrama Entidade-Relacionamento
├── .gitignore
└── README.md
```

## API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registrar novo usuário | Não |
| POST | `/api/auth/login` | Fazer login | Não |
| GET | `/api/auth/profile` | Obter perfil do usuário | Sim |

### Barbeiros

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/barbers` | Listar todos os barbeiros | Sim |
| GET | `/api/barbers/:id` | Obter barbeiro por ID | Sim |
| GET | `/api/barbers/specialty/:specialtyId` | Listar barbeiros por especialidade | Sim |
| GET | `/api/barbers/:id/specialties` | Obter especialidades de um barbeiro | Admin |
| POST | `/api/barbers` | Criar barbeiro | Admin |
| PUT | `/api/barbers/:id` | Atualizar barbeiro | Admin |
| PUT | `/api/barbers/:id/specialties` | Atualizar especialidades do barbeiro | Admin |
| DELETE | `/api/barbers/:id` | Deletar barbeiro | Admin |

**Nota sobre especialidades:**
- O endpoint `PUT /api/barbers/:id/specialties` recebe `{ specialty_ids: [1, 2, 3] }`
- Substitui TODAS as especialidades antigas pelas novas (sincronização)
- Usa transação PostgreSQL para garantir atomicidade

### Especialidades

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/specialties` | Listar todas as especialidades | Sim |
| GET | `/api/specialties/:id` | Obter especialidade por ID | Sim |
| POST | `/api/specialties` | Criar especialidade | Admin |
| PUT | `/api/specialties/:id` | Atualizar especialidade | Admin |
| DELETE | `/api/specialties/:id` | Deletar especialidade | Admin |

### Agendamentos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/appointments/available-slots` | Obter horários disponíveis | Sim |
| POST | `/api/appointments` | Criar agendamento | Sim |
| GET | `/api/appointments/my-appointments` | Listar agendamentos do usuário | Sim |
| GET | `/api/appointments/all` | Listar todos os agendamentos | Admin |
| GET | `/api/appointments/today` | Listar agendamentos de hoje | Admin |
| GET | `/api/appointments/future` | Listar agendamentos futuros | Admin |
| PATCH | `/api/appointments/:id/cancel` | Cancelar agendamento | Sim |
| PATCH | `/api/appointments/:id/complete` | Marcar como concluído | Admin |

## Diagrama ER

O diagrama Entidade-Relacionamento completo está disponível em: [docs/diagrama-er.md](docs/diagrama-er.md)

### Resumo das Tabelas

- **users** - Clientes do sistema
- **barbers** - Barbeiros disponíveis
- **specialties** - Serviços oferecidos
- **barber_specialties** - Relacionamento N:M entre barbeiros e especialidades
- **appointments** - Agendamentos realizados

## Usuários de Teste

Após executar o script `seed.sql`, você terá os seguintes usuários:

### Administrador
- **Email:** admin@clickbeard.com
- **Senha:** password123

### Clientes
- **Email:** joao@email.com - **Senha:** password123
- **Email:** maria@email.com - **Senha:** password123
- **Email:** pedro@email.com - **Senha:** password123

## Regras de Negócio

### Horários
- Funcionamento: Todos os dias, 8h às 18h
- Duração de cada atendimento: 30 minutos
- Horários disponíveis: 8:00, 8:30, 9:00, ..., 17:00, 17:30

### Agendamentos
1. Cliente deve estar autenticado
2. Deve escolher uma especialidade
3. Deve escolher um barbeiro que tenha essa especialidade
4. Deve escolher uma data futura
5. Deve escolher um horário disponível
6. Um barbeiro não pode ter dois atendimentos no mesmo horário
7. Cancelamento permitido até 2 horas antes do horário

### Autenticação
- Senhas são criptografadas com bcrypt
- Tokens JWT válidos por 7 dias
- Email deve ser único no sistema
- Senha deve ter no mínimo 6 caracteres

## Segurança

O sistema implementa diversas práticas de segurança:

- ✅ Senhas criptografadas com bcrypt (hash + salt)
- ✅ Autenticação via JWT (JSON Web Tokens)
- ✅ Validação de dados no backend
- ✅ Proteção contra SQL Injection (prepared statements)
- ✅ CORS configurado
- ✅ Middleware de autenticação em rotas protegidas
- ✅ Separação de permissões (cliente vs admin)

## Autor

Desenvolvido por Murilo Gallon Barcelos

## Licença

Este projeto está sob a licença MIT.
