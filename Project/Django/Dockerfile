FROM python:3.9

ENV PYTHONUNBUFFERED=1

RUN mkdir /app
WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt


CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
