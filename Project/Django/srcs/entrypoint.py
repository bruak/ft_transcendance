import os
import sys
import time
import django
import psycopg2
from django.core.management import execute_from_command_line, call_command
from django.contrib.auth import get_user_model

def main():
    i = 0
    while 1:
        try:
            conn = psycopg2.connect(
                dbname=os.environ.get("POSTGRES_DB", "mydb"),
                user=os.environ.get("POSTGRES_USER", "myuser"),
                password=os.environ.get("POSTGRES_PASSWORD", "mypass"),
                host=os.environ.get("DB_HOST", "db"),
                port=os.environ.get("DB_PORT", "5432")
            )
            if conn:
                conn.close()
                print("Bağlantı başarılı!")
                break
            elif i == 10:
                print("Bağlantı başarısız! Tekrar deneyin...")
                sys.exit(1)
        except psycopg2.OperationalError as e:
            print("Bağlantı başarısız! Tekrar deneyin...")
            i += 1
            time.sleep(2)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "user_service.settings")
    django.setup()  # Django başlatılıyor

    try:
        call_command("makemigrations")
        call_command("migrate")
    except Exception as e:
        print(f"Migrations başarısız!\n{e}")

    User = get_user_model()
    superuser_email = os.environ.get("SUPERUSER_EMAIL", "admin@example.com")
    superuser_password = os.environ.get("SUPERUSER_PASSWORD", "admin")

    if not User.objects.filter(email=superuser_email).exists():
        print("Süper kullanıcı oluşturuluyor...")
        User.objects.create_superuser(
            username=os.environ.get("SUPERUSER_USERNAME", "admin"),
            email=superuser_email,
            password=superuser_password
        )
        print("Süper kullanıcı başarıyla oluşturuldu!")
    else:
        print("Süper kullanıcı zaten mevcut.")

    sys.argv = ["manage.py", "runserver", "0.0.0.0:8000"]
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
