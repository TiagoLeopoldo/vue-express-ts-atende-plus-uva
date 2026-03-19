# Atende+
### Sistema Inteligente de Agendamento de Consultas

O **Atende+** é uma plataforma moderna projetada para simplificar o agendamento de consultas em clínicas médicas. Focado na experiência do paciente e na eficiência administrativa, o sistema oferece um fluxo completo desde o cadastro até a conclusão do atendimento.

---

## Diferenciais do Produto
- **Experiência Humanizada:** Interface limpa, acolhedora e totalmente em português (pt-BR).
- **Inteligência de Dados:** Integração com ViaCEP para endereços e OpenWeather para previsão do tempo no dia da consulta.
- **Painel Administrativo Robusto:** Controle total sobre a agenda da clínica, permitindo confirmar, concluir ou excluir agendamentos. (usuário: admin@atendemais.com / senha: senha)
- **Sessão Persistente:** Segurança com JWT e persistência de estado para evitar reconexões desnecessárias.

---

## Tecnologias Utilizadas

### Backend
- **Node.js + Express + TypeScript**
- **MongoDB + Mongoose**
- **JWT + bcryptjs** (Autenticação Segura)
- **Middleware de Autorização** (RBAC: Admin vs Paciente)

### Frontend
- **Vue 3 (Composition API)**
- **Vite** (Performance de Build)
- **Pinia** (Gestão de Estado Reativo)
- **Vue Router** (Navegação SPA)
- **Vanilla CSS** (Design Moderno e Customizado)

---

## Configuração do Ambiente

1. **Backend (`/backend/.env`):**
   ```env
   PORT=3000
   MONGODB_URI=sua_uri_do_mongodb
   JWT_SECRET=sua_chave_secreta
   OPENWEATHER_API_KEY=sua_chave_da_api
   ```

2. **Frontend (`/frontend/.env`):**
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

---

## Como Rodar o Projeto

### Requisitos
- Node.js (v18+)
- MongoDB ativo

### Passo a Passo

1. **Preparar o Servidor:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Preparar o Cliente:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Acesse o sistema em: `http://localhost:5173`

---

## Visão Geral da API

### Autenticação (`/api/auth`)
- `POST /register`: Cadastro de novos usuários.
- `POST /login`: Autenticação e geração de token.
- `GET /profile`: Recuperação de dados da sessão ativa.

### Consultas (`/api/appointments`)
- `POST /`: Agendamento de nova consulta (Paciente).
- `GET /my-appointments`: Lista personalizada (Paciente).
- `GET /`: Visão global da agenda (Admin).
- `PATCH /:id/status`: Alteração de status (Confirmar/Concluir/Cancelar).
- `DELETE /:id`: Remoção de registros (Admin).

### Integrações (`/api/integrations`)
- `GET /cep/:cep`: Consulta de endereço automatizada.

---

## Segurança e Regras de Negócio
- Senhas criptografadas com `bcryptjs`.
- Proteção de rotas administrativas no nível de API e Interface.
- Validação contra conflitos de horário e datas retroativas.
- Tags de status visual: `Agendada`, `Confirmada`, `Cancelada` e `Concluída`.

## Deploy
https://vue-express-ts-atende-plus-uva.vercel.app/
---

### Contexto Acadêmico
Este projeto foi desenvolvido como trabalho acadêmico de conclusão da AVA2 para a disciplina de **Backend I** do curso de Análise e Desenvolvimento de Sistemas da **Universidade Veiga de Almeida (UVA)**.
