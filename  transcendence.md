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

# https://localhost:8080/api/user/get/ GET
- Headers   "Content-Type": "application/json", "Accept": "application/json", "Accept-Language": "tr"   "Authorization": "Bearer <token>",
- atılan fetch isteğinden sonra tüm kayıtlı userları veriyor şu şekilde örnek

# https://localhost:8080/api/user/getuser/<username>/ GET
- Headers   "Content-Type": "application/json", "Accept": "application/json", "Accept-Language": "tr"   "Authorization": "Bearer <token>",


# https://localhost:8080/api/friend/send_friend_request/ POST
- Kullanıcıya Arkadaşlık İsteği Gönderme
- Headers   "Content-Type": "application/json", "Accept": "application/json", "Accept-Language": "tr"   "Authorization": "Bearer <token>",
- "username": "value"
- "friend"  : "value"

# https://localhost:8080/api/friend/list_friend_requests/<username>/ GET
- Kullanıcıya Gönderilen Arkadaşlık İstekleri
- Headers   "Content-Type": "application/json", "Accept": "application/json", "Accept-Language": "tr"   "Authorization": "Bearer <token>",

# https://localhost:8080/api/friend/friends/<username>/ GET
- Kullanının Arkadaşları
- Headers   "Content-Type": "application/json", "Accept": "application/json", "Accept-Language": "tr"   "Authorization": "Bearer <token>",


# https://localhost:8080/api/friend/accept_friend_request/ POST
- Gelen Arkadaşlık İsteğini Kabul Etme
- Headers   "Content-Type": "application/json", "Accept": "application/json", "Accept-Language": "tr"   "Authorization": "Bearer <token>",
- "username"  : "value"
- "friendname": "value"
