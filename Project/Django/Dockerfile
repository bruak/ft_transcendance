<<<<<<< HEAD
FROM python:3.9-slim-bookworm
=======
FROM python:3.9-slim
>>>>>>> origin/Tufan

RUN apt update && apt install -y postgresql-client \
&& mkdir /app

WORKDIR /app

<<<<<<< HEAD
COPY requirements.sh /
RUN chmod +x /requirements.sh

ENTRYPOINT [ "/requirements.sh" ]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
=======
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "entrypoint.py"]
>>>>>>> origin/Tufan
