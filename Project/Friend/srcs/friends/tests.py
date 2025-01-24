import requests

url = "http://172.18.0.6:8000/api/getuser/tkurukay"  # API URL'si

response = requests.get(url)

# Gelen veriyi kontrol etmek ve kullanmak
if response.status_code == 200:  # 200: Başarılı
    data = response.json()  # JSON formatındaki yanıtı parse etmek
    print(data)
else:
    print(f"Hata: {response.status_code}")
