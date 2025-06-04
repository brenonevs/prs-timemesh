FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instala o netcat para o wait-for-db
RUN apt-get update && apt-get install -y netcat-openbsd

COPY . .

RUN chmod +x /app/start.sh

EXPOSE 8080

CMD ["/app/start.sh"]
