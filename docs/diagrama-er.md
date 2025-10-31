# Diagrama Entidade-Relacionamento - ClickBeard

## Descrição do Modelo de Dados

O sistema ClickBeard utiliza um banco de dados PostgreSQL com 5 tabelas principais:

## Entidades

### 1. USERS (Usuários/Clientes)
Armazena informações dos clientes que utilizam o sistema.

**Atributos:**
- `id` (PK) - Serial, chave primária
- `name` - VARCHAR(100), nome completo
- `email` - VARCHAR(100), email único (UNIQUE)
- `password` - VARCHAR(255), senha hash (bcrypt)
- `is_admin` - BOOLEAN, indica se é administrador
- `created_at` - TIMESTAMP, data de criação

**Relacionamentos:**
- Um usuário pode ter MUITOS agendamentos (1:N com APPOINTMENTS)

---

### 2. BARBERS (Barbeiros)
Armazena informações dos barbeiros disponíveis.

**Atributos:**
- `id` (PK) - Serial, chave primária
- `name` - VARCHAR(100), nome completo
- `age` - INTEGER, idade
- `hire_date` - DATE, data de contratação
- `active` - BOOLEAN, indica se está ativo
- `created_at` - TIMESTAMP, data de criação

**Relacionamentos:**
- Um barbeiro pode ter MUITAS especialidades (N:M com SPECIALTIES via BARBER_SPECIALTIES)
- Um barbeiro pode ter MUITOS agendamentos (1:N com APPOINTMENTS)

---

### 3. SPECIALTIES (Especialidades/Serviços)
Armazena os tipos de serviços oferecidos.

**Atributos:**
- `id` (PK) - Serial, chave primária
- `name` - VARCHAR(100), nome da especialidade (UNIQUE)
- `description` - TEXT, descrição do serviço
- `created_at` - TIMESTAMP, data de criação

**Relacionamentos:**
- Uma especialidade pode ser oferecida por MUITOS barbeiros (N:M com BARBERS via BARBER_SPECIALTIES)
- Uma especialidade pode ter MUITOS agendamentos (1:N com APPOINTMENTS)

---

### 4. BARBER_SPECIALTIES (Tabela Associativa)
Relaciona barbeiros com suas especialidades (relação N:M).

**Atributos:**
- `id` (PK) - Serial, chave primária
- `barber_id` (FK) - INTEGER, referencia BARBERS(id)
- `specialty_id` (FK) - INTEGER, referencia SPECIALTIES(id)
- `created_at` - TIMESTAMP, data de criação

**Constraints:**
- UNIQUE(barber_id, specialty_id) - Um barbeiro não pode ter a mesma especialidade duplicada

**Relacionamentos:**
- Muitos para Um com BARBERS
- Muitos para Um com SPECIALTIES

---

### 5. APPOINTMENTS (Agendamentos)
Armazena os agendamentos realizados pelos clientes.

**Atributos:**
- `id` (PK) - Serial, chave primária
- `user_id` (FK) - INTEGER, referencia USERS(id)
- `barber_id` (FK) - INTEGER, referencia BARBERS(id)
- `specialty_id` (FK) - INTEGER, referencia SPECIALTIES(id)
- `appointment_date` - DATE, data do agendamento
- `appointment_time` - TIME, horário do agendamento
- `status` - VARCHAR(20), status (scheduled/completed/cancelled)
- `created_at` - TIMESTAMP, data de criação
- `updated_at` - TIMESTAMP, data de atualização

**Constraints:**
- UNIQUE(barber_id, appointment_date, appointment_time) - Previne conflitos de horário
- CHECK(status IN ('scheduled', 'completed', 'cancelled'))

**Relacionamentos:**
- Muitos para Um com USERS
- Muitos para Um com BARBERS
- Muitos para Um com SPECIALTIES

---

## Diagrama Visual (Texto)

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ PK id           │
│    name         │
│    email (UQ)   │
│    password     │
│    is_admin     │
│    created_at   │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────┴────────────────────────────┐
│         APPOINTMENTS                │
├─────────────────────────────────────┤
│ PK id                               │
│ FK user_id                          │
│ FK barber_id                        │
│ FK specialty_id                     │
│    appointment_date                 │
│    appointment_time                 │
│    status                           │
│    created_at                       │
│    updated_at                       │
│ UQ(barber_id, date, time)           │
└──────────┬──────────────┬───────────┘
           │ N            │ N
           │              │
         1 │            1 │
┌──────────┴────────┐     │
│     BARBERS       │     │
├───────────────────┤     │
│ PK id             │     │
│    name           │     │
│    age            │     │
│    hire_date      │     │
│    active         │     │
│    created_at     │     │
└──────────┬────────┘     │
         N │              │
           │              │
           │ N          1 │
┌──────────┴────────────┐ │
│ BARBER_SPECIALTIES    │ │
├───────────────────────┤ │
│ PK id                 │ │
│ FK barber_id          │ │
│ FK specialty_id       │ │
│    created_at         │ │
│ UQ(barber_id,         │ │
│    specialty_id)      │ │
└──────────┬────────────┘ │
         N │              │
           │              │
         1 │              │
┌──────────┴────────┐     │
│   SPECIALTIES     │     │
├───────────────────┤     │
│ PK id             │◄────┘
│    name (UQ)      │
│    description    │
│    created_at     │
└───────────────────┘
```

## Índices

Para melhor performance, foram criados os seguintes índices:

1. `idx_appointments_user` - Índice em appointments(user_id)
2. `idx_appointments_barber` - Índice em appointments(barber_id)
3. `idx_appointments_date` - Índice em appointments(appointment_date)
4. `idx_appointments_status` - Índice em appointments(status)
5. `idx_barber_specialties_barber` - Índice em barber_specialties(barber_id)
6. `idx_barber_specialties_specialty` - Índice em barber_specialties(specialty_id)
7. `idx_users_email` - Índice em users(email)

## Regras de Negócio Implementadas

1. **Email único**: Cada usuário deve ter um email único no sistema
2. **Especialidades únicas**: Nomes de especialidades devem ser únicos
3. **Barbeiro-Especialidade única**: Um barbeiro não pode ter a mesma especialidade duas vezes
4. **Horário único por barbeiro**: Um barbeiro não pode ter dois agendamentos no mesmo horário
5. **Status validado**: Agendamentos só podem ter status: scheduled, completed ou cancelled
6. **Cascata em deleções**: Se um barbeiro, especialidade ou usuário for deletado, seus registros relacionados também são removidos

## Cardinalidade dos Relacionamentos

- **USERS → APPOINTMENTS**: 1:N (Um usuário pode ter muitos agendamentos)
- **BARBERS → APPOINTMENTS**: 1:N (Um barbeiro pode ter muitos agendamentos)
- **SPECIALTIES → APPOINTMENTS**: 1:N (Uma especialidade pode ter muitos agendamentos)
- **BARBERS ↔ SPECIALTIES**: N:M (Muitos barbeiros podem ter muitas especialidades)
