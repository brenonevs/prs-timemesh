#!/bin/bash

echo "Aguardando o banco de dados ficar pronto..."
# Espera o banco responder na porta 5432
until nc -z $DB_HOST $DB_PORT; do
  echo "Banco ainda não está pronto. Tentando novamente em 2 segundos..."
  sleep 2
done
echo "Banco está pronto!"

echo "Aplicando migrações..."
python manage.py migrate --no-input

echo "Verificando superusuário..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
import os
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@admin.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
" && echo "Superusuário criado ou já existe."

echo "Iniciando o servidor Django..."
python manage.py runserver 0.0.0.0:8000
