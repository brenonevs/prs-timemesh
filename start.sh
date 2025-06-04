#!/bin/bash

echo "Iniciando o servidor Django..."

PORT="${PORT:-8080}"
echo "Servidor iniciando na porta $PORT"

# Setup e migrações em segundo plano
(
    until nc -z $DB_HOST $DB_PORT; do
        echo "Esperando pelo banco de dados em $DB_HOST:$DB_PORT..."
        sleep 2
    done
    echo "Banco de dados disponível!"

    echo "Executando migrações..."
    python manage.py migrate --no-input

    echo "Criando superusuário (se necessário)..."
    python manage.py shell -c "
from django.contrib.auth import get_user_model
import os
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
if username and email and password and not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
"
) &

echo "Iniciando o servidor Django..."
python manage.py runserver 0.0.0.0:8000
