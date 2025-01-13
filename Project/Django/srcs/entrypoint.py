import os
import sys
import time
import django
import psycopg2
from django.core.management import execute_from_command_line, call_command

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
                print("CONNECTION SUCCES, SUCCES, SUCCES, SUCCES!")
                break
            elif i == 10:
                print("CONNECTION FAILLL!!!!!!!!!! TRY AGAIN!!!!!!!!")
                sys.exit(1)
        except psycopg2.OperationalError as e:
            print("CONNECTION FAILLL!!!!!!!!!! TRY AGAIN!!!!!!!!")
            i += 1
            time.sleep(2)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "user_service.settings")
    django.setup()

    try:
        call_command("makemigrations")
        call_command("migrate")
    except Exception as e:
        print(f"MIGRATION FAILUREEEE!\n{e}")

    sys.argv = ["manage.py", "runserver", "0.0.0.0:8000"]
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
