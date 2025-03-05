import os
import sys
from django.core.management import execute_from_command_line
from notification_service.settings import DEBUG
def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "notification_service.settings")
    if DEBUG == False:
        # Son adım: DAPHNE ile server'ı başlatıyoruz
        host = os.environ.get("APP_HOST", "0.0.0.0")
        port = os.environ.get("APP_PORT", "8000")

        # Projenizdeki asgi uygulamasının yolunu yazın:
        asgi_app_path = "notification_service.asgi:application"

        # daphne'yi çalıştır
        cmd = f"daphne -b {host} -p {port} {asgi_app_path}"
        print(f"Sunucu başlatılıyor: {cmd}")
        os.system(cmd)
    else:
        sys.argv = ["manage.py", "runserver", "0.0.0.0:8000"]
        execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
