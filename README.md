# TimeMesh

TimeMesh is a web application developed with Django and Django REST Framework, focused on managing time availability for authenticated users. The project uses JWT authentication to ensure security in operations and is prepared to run in a Docker environment, using PostgreSQL as the database.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [How to Run (Docker)](#how-to-run-docker)
- [API Endpoints](#api-endpoints)
- [Usage Example](#usage-example)

---

## Overview

TimeMesh allows users to register, query, update, and remove time availability slots. Each user can only view and manipulate their own time slots, ensuring privacy and security. The system is ideal for scheduling applications, reservations, or personal/professional agenda organization.

---

## Features

- User registration (via Django Admin)
- JWT (JSON Web Token) authentication
- CRUD operations for time availability slots
- Automatic slot association with the authenticated user
- Access restrictions: each user only sees and manipulates their own slots
- RESTful API ready for integration with frontends or other systems

---

## Technologies Used

- Python 3
- Django 5.2
- Django REST Framework
- Django SimpleJWT
- PostgreSQL
- Docker and Docker Compose

---

## How to Run (Docker)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd prs-timemesh
   ```

2. **Configure environment variables:**
   - Create a `.env` file in the project root with the following variables:
     ```
     SECRET_KEY=a_secret_key
     DEBUG=True
     ALLOWED_HOSTS=*
     DB_NAME=timemesh
     DB_USER=postgres
     DB_PASSWORD=postgres
     DB_HOST=db
     DB_PORT=5432
     ```

3. **Start the containers:**
   ```bash
   docker compose up --build
   ```

4. **Access the web container and run migrations:**
   ```bash
   docker compose exec web python manage.py makemigrations
   docker compose exec web python manage.py migrate
   ```

5. **(Optional) Create a superuser to access the admin:**
   ```bash
   docker compose exec web python manage.py createsuperuser
   ```

6. **Access the application:**
   - API: http://localhost:8000/
   - Admin: http://localhost:8000/admin/

---

## API Endpoints

### Authentication

- `POST /api/token/`  
  Get JWT token.  
  **Body:**  
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

- `POST /api/token/refresh/`  
  Refresh access token using refresh token.

### Availability Slots

All endpoints below require JWT authentication in the header:

   ```bash
   Authorization: Bearer <your_token>
   ```

- `GET /api/availability/slots/`  
  List all slots of the authenticated user.

- `POST /api/availability/slots/`  
  Create a new slot.  
  **Body:**  
  ```json
  {
    "start_time": "09:00:00",
    "end_time": "10:00:00"
  }
  ```

- `GET /api/availability/slots/<id>/`  
  Get details of a specific slot.

- `PUT /api/availability/slots/<id>/`  
  Update a slot.

- `PATCH /api/availability/slots/<id>/`  
  Partially update a slot.

- `DELETE /api/availability/slots/<id>/`  
  Delete a slot.

### Groups

- `GET /api/groups/`  
  List all groups where the user is an accepted member.

- `POST /api/groups/`  
  Create a new group.  
  **Body:**  
  ```json
  {
    "name": "Group Name"
  }
  ```

- `POST /api/groups/<group_id>/invite/`  
  Invite a user to the group.  
  **Body:**  
  ```json
  {
    "username": "username_to_invite"
  }
  ```

- `POST /api/groups/<group_id>/accept/`  
  Accept a group invitation.

- `GET /api/groups/<group_id>/members/`  
  List all accepted members of a group.

- `GET /api/groups/pending-invites/`  
  List all pending invitations for the authenticated user.

### Group Availability

- `POST /api/availability/group/<group_id>/match/`  
  Find common availability slots between all group members.  
  **Body:**  
  ```json
  {
    "date": "2024-05-04"
  }
  ```

---

## Usage Example

1. **Get JWT token:**
   ```bash
   curl -X POST http://localhost:8000/api/token/ -d '{"username":"user","password":"password"}' -H "Content-Type: application/json"
   ```

2. **Create an availability slot:**
   ```bash
   curl -X POST http://localhost:8000/api/availability/slots/ \
     -H "Authorization: Bearer <your_token>" \
     -H "Content-Type: application/json" \
     -d '{"start_time":"09:00:00","end_time":"10:00:00"}'
   ```

3. **List slots:**
   ```bash
   curl -H "Authorization: Bearer <your_token>" http://localhost:8000/api/availability/slots/
   ```

4. **Create a group:**
   ```bash
   curl -X POST http://localhost:8000/api/groups/ \
     -H "Authorization: Bearer <your_token>" \
     -H "Content-Type: application/json" \
     -d '{"name":"Study Group"}'
   ```

5. **Find common availability in a group:**
   ```bash
   curl -X POST http://localhost:8000/api/availability/group/1/match/ \
     -H "Authorization: Bearer <your_token>" \
     -H "Content-Type: application/json" \
     -d '{"date":"2024-05-04"}'
   ```

---

