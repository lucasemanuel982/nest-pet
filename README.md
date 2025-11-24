# API de Gestão de Pets

API REST robusta e escalável para gestão de pets e agendamentos, desenvolvida com NestJS, TypeScript, Prisma e MySQL.

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando a Aplicação](#executando-a-aplicação)
- [Documentação da API](#documentação-da-api)
- [Endpoints](#endpoints)
- [Testes](#testes)
- [Tecnologias](#tecnologias)

## Pré-requisitos

- Node.js (v18 ou superior)
- Docker e Docker Compose
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd Nest
```

2. Instale as dependências se for rodar localmente sem o docker:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações, segue exemplo do env.example.txt:
```env
DATABASE_URL="mysql://petuser:petpassword@localhost:3306/pet_management"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
WEBHOOK_URL="http://localhost:8080/webhook"
PORT=3000
```

## Executando com Docker Compose

Para subir toda a infraestrutura (MySQL + API):

```bash
docker-compose up -d
```

Isso irá:
- Criar e iniciar o container MySQL
- Criar e iniciar o container da API NestJS
- Aplicar as migrações do Prisma automaticamente

## Executando Localmente (sem Docker)

1. Inicie o MySQL (se não estiver usando Docker):
```bash
docker-compose up -d mysql
```

2. Gere o cliente Prisma:
```bash
npm run prisma:generate
```

3. Execute as migrações:
```bash
npm run prisma:migrate
```

4. Popule o banco com dados de exemplo:
```bash
npm run seed
```

5. Inicie a aplicação em modo desenvolvimento:
```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`

## Documentação da API

A documentação Swagger está disponível em:
```
http://localhost:3000/docs
```

A documentação inclui:
- Todos os endpoints disponíveis
- Modelos de requisição e resposta
- Exemplos de uso
- Autenticação JWT


## Endpoints Principais

### Autenticação

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login e obter JWT

### Usuários

- `GET /users/me` - Obter dados do usuário autenticado (protegido)

### Pets

- `POST /pets` - Criar novo pet (protegido)
- `GET /pets` - Listar pets do usuário (protegido)
- `GET /pets/:id` - Obter pet específico (protegido)
- `PATCH /pets/:id` - Atualizar pet (protegido)
- `DELETE /pets/:id` - Remover pet (protegido)

### Agendamentos

- `POST /schedules` - Criar novo agendamento (protegido)
- `GET /schedules` - Listar agendamentos (protegido)
  - Query params: `?date=YYYY-MM-DD` e `?service=Consulta`
- `GET /schedules/:id` - Obter agendamento específico (protegido)
- `PATCH /schedules/:id` - Atualizar agendamento (protegido)
- `DELETE /schedules/:id` - Remover agendamento (protegido)

## Testes

Execute os testes unitários:
```bash
npm test
```

Execute com cobertura:
```bash
npm run test:cov
```

Execute em modo watch:
```bash
npm run test:watch
```

## Scripts Disponíveis

- `npm run start:dev` - Inicia em modo desenvolvimento
- `npm run build` - Compila o projeto
- `npm run start:prod` - Inicia em modo produção
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate` - Executa migrações
- `npm run migrate` - Aplica migrações (produção)
- `npm run seed` - Popula o banco com dados de exemplo
- `npm test` - Executa testes unitários
- `npm run lint` - Executa o linter

## Modelo de Dados

### User
- id, email (único), password (hash), name, createdAt
- Relacionamento 1:N com Pet

### Pet
- id, name, species, age, weight, observations, ownerId, createdAt, updatedAt
- Relacionamento N:1 com User
- Relacionamento 1:N com Schedule

### Schedule
- id, date, service, status (PENDING/CONFIRMED/COMPLETED/CANCELED), observations, petId, createdAt, updatedAt
- Relacionamento N:1 com Pet

### AuditLog
- id, action, details (JSON), userId, timestamp

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após fazer login, você receberá um token que deve ser enviado no header:

```
Authorization: Bearer <seu-token>
```

## Funcionalidades Extras

### Log de Auditoria
Todas as ações de criação, atualização e exclusão de agendamentos são registradas automaticamente no `AuditLog`.

### Webhook
Quando o status de um agendamento é alterado, uma requisição POST assíncrona é enviada para a `WEBHOOK_URL` configurada no `.env`, contendo:
- `scheduleId`: ID do agendamento
- `oldStatus`: Status anterior
- `newStatus`: Novo status

Para utilizar o webhook: https://webhook.site/
Irá gerar uma rota e com isso dará para realizar os testes.

## Tecnologias

- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem de programação
- **Prisma** - ORM
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Docker** - Containerização
- **Jest** - Framework de testes
- **bcrypt** - Hash de senhas
- **class-validator** - Validação de DTOs





