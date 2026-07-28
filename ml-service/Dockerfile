FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app:app --host ${ML_SERVICE_HOST:-0.0.0.0} --port ${ML_SERVICE_PORT:-8000}"]
