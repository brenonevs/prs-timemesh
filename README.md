# TimeMesh

TimeMesh é uma aplicação web desenvolvida com Django e Django REST Framework, focada no gerenciamento de disponibilidade de horários para usuários autenticados. O projeto utiliza autenticação JWT para garantir segurança nas operações e está preparado para ser executado em ambiente Docker, utilizando PostgreSQL como banco de dados.

---

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como Executar (Docker)](#como-executar-docker)
- [Endpoints da API](#endpoints-da-api)
- [Exemplo de Uso](#exemplo-de-uso)

---

## Visão Geral

O TimeMesh permite que usuários cadastrem, consultem, atualizem e removam slots de disponibilidade de horários. Cada usuário só pode visualizar e manipular seus próprios horários, garantindo privacidade e segurança. O sistema é ideal para aplicações de agendamento, reservas ou organização de agendas pessoais/profissionais.

---

## Funcionalidades

- Cadastro de usuários (via Django Admin)
- Autenticação via JWT (JSON Web Token)
- CRUD de slots de disponibilidade de horários
- Associação automática do slot ao usuário autenticado
- Restrições de acesso: cada usuário só vê e manipula seus próprios slots
- API RESTful pronta para integração com frontends ou outros sistemas

---

## Tecnologias Utilizadas

- Python 3
- Django 5.2
- Django REST Framework
- Django SimpleJWT
- PostgreSQL
- Docker e Docker Compose

---

## Como Executar (Docker)

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd prs-timemesh
   ```

2. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
     ```
     SECRET_KEY=uma_chave_secreta
     DEBUG=True
     ALLOWED_HOSTS=*
     DB_NAME=timemesh
     DB_USER=postgres
     DB_PASSWORD=postgres
     DB_HOST=db
     DB_PORT=5432
     ```

3. **Suba os containers:**
   ```bash
   docker compose up --build
   ```

4. **Acesse o container web e rode as migrações:**
   ```bash
   docker compose exec web python manage.py makemigrations
   docker compose exec web python manage.py migrate
   ```

5. **(Opcional) Crie um superusuário para acessar o admin:**
   ```bash
   docker compose exec web python manage.py createsuperuser
   ```

6. **Acesse a aplicação:**
   - API: http://localhost:8000/
   - Admin: http://localhost:8000/admin/

---

## Endpoints da API

### Autenticação

- `POST /api/token/`  
  Obtém o token JWT.  
  **Body:**  
  ```json
  {
    "username": "seu_usuario",
    "password": "sua_senha"
  }
  ```

- `POST /api/token/refresh/`  
  Atualiza o token de acesso usando o refresh token.

### Slots de Disponibilidade

Todos os endpoints abaixo exigem autenticação JWT no header:

   ```bash
   Authorization: Bearer <seu_token>
   ```


- `GET /api/availability/slots/`  
  Lista todos os slots do usuário autenticado.

- `POST /api/availability/slots/`  
  Cria um novo slot.  
  **Body:**  
  ```json
  {
    "start_time": "09:00:00",
    "end_time": "10:00:00"
  }
  ```

- `GET /api/availability/slots/<id>/`  
  Detalha um slot específico.

- `PUT /api/availability/slots/<id>/`  
  Atualiza um slot.

- `PATCH /api/availability/slots/<id>/`  
  Atualiza parcialmente um slot.

- `DELETE /api/availability/slots/<id>/`  
  Remove um slot.

---

## Exemplo de Uso

1. **Obter token JWT:**
   ```bash
   curl -X POST http://localhost:8000/api/token/ -d '{"username":"usuario","password":"senha"}' -H "Content-Type: application/json"
   ```

2. **Criar um slot de disponibilidade:**
   ```bash
   curl -X POST http://localhost:8000/api/availability/slots/ \
     -H "Authorization: Bearer <seu_token>" \
     -H "Content-Type: application/json" \
     -d '{"start_time":"09:00:00","end_time":"10:00:00"}'
   ```

3. **Listar slots:**
   ```bash
   curl -H "Authorization: Bearer <seu_token>" http://localhost:8000/api/availability/slots/
   ```

---

