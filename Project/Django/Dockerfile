FROM python:3.9-slim-bookworm

RUN apt update && apt install -y postgresql-client \
&& mkdir /app

WORKDIR /app

COPY requirements.sh /
RUN chmod +x /requirements.sh

ENTRYPOINT [ "/requirements.sh" ]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
