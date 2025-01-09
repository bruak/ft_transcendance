FROM python:3.9-slim

RUN apt update && apt install -y postgresql-client \
     && mkdir /app
WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "entrypoint.py"]
