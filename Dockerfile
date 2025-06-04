FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y netcat-openbsd

COPY . .

RUN chmod +x /app/start.sh

EXPOSE 8080

CMD ["/app/start.sh"]

