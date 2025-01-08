import psycopg2
import os
import sys
import time
from django.core.management import execute_from_command_line
def main():
    i = 0
    while i < 10:
        try:

            conn = psycopg2.connect(
                dbname=os.environ.get("POSTGRES_DB", "mydb"),
                user=os.environ.get("POSTGRES_USER", "myuser"),
                password=os.environ.get("POSTGRES_PASSWORD", "mypass"),
                host=os.environ.get("DB_HOST", "db"),   # localhost yerine 'db'
                port=os.environ.get("DB_PORT", "5432")
            )
            if conn:
                break
            conn.close()
            print("Bağlantı başarılı!")
        except psycopg2.OperationalError as e:
            print("Bağlantı başarısız! Tekrar deneyin...")
            i += 1
            time.sleep(2)
    """Django Sunucusunu 0.0.0.0:8000'de çalıştırır."""
    # Django ayar dosyanızın konumunu belirtin
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "djangoservice.settings")

    # "runserver 0.0.0.0:8000" komutu gibi davranması için:
    sys.argv = ["manage.py", "runserver", "0.0.0.0:8000"]
    execute_from_command_line(sys.argv)
    # Ardından 8000 portunda server'ı başlatabilirsiniz.

if __name__ == "__main__":
    main()
