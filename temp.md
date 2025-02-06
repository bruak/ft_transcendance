# Auth Service
# https://localhost:8080/api/auth/singup/ POST
- Giden Veri FormData Türünde Olucak ve File Göndericek
- Headers
    "Content-Type": "multipart/form-data",
    "Accept": "application/json",
    "Accept-Language": "tr",
- first_name (Text)
- last_name (Text)
- username (Text)
- email (Text)
- password (Text)
- avatar (File)
- note: bunları postman üzerinden de kontrol edebilirsin kanka, tufan kurmaya çalışıyor şimdi.
# https://localhost:8080/api/auth/singin/ POST
- Headers   "Content-Type": "application/json", "Accept": "application/json",   "Accept-Language": "tr",
- "sign" : "Value",
- "password" : "Value"
# https://localhost:8080/api/auth/twofactor/ POST
- Headers   "Content-Type": "application/json", "Accept": "application/json",   "Accept-Language": "tr",
- "username": "value"
- "code": "value"
# https://localhost:8080/api/auth/singout/ GET
- Headers   "Content-Type": "application/json", "Accept": "application/json",   "Accept-Language": "tr"   "Authorization": "Bearer <token>",
# https://localhost:8080/api/user/get/ 
- method: GET
- Headers: "Accept": "application/json", "Accept-Language": "tr", "Authorization": "Bearer <token>",
# https://localhost:8080/api/user/getuser/<username> GET
- username kısmına kullanıcı adını gönderip fetch atcan kanks


# Game 
- game random eslestirme mekanigi hazir api gerway eklenecek
- Eslestirme icin kisi aramayi bitirirse odayi kapatacak 




