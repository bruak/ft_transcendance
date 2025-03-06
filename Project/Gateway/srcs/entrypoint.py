import os
import sys
from django.core.management import execute_from_command_line
from gateway_service.settings import DEBUG
def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gateway_service.settings")

    if DEBUG == False:
        host = os.environ.get("APP_HOST", "0.0.0.0")
        port = os.environ.get("APP_PORT", "8000")
        workers = os.environ.get("APP_WORKERS", "4")  

        wsgi_app_path = "gateway_service.wsgi:application"

        cmd = f"gunicorn --bind {host}:{port} --workers {workers} {wsgi_app_path}"
        print(f"Sunucu başlatılıyor: {cmd}")
        os.system(cmd)
    else:
        sys.argv = ["manage.py", "runserver", "0.0.0.0:8000"]
        execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
