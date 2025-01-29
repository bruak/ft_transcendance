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

# http://127.0.0.1:8000/api/get/
- atılan fetch isteğinden sonra tüm kayıtlı userları veriyor şu şekilde örnek ->
***
[
    {
        "first_name": "burak",
        "last_name": "soykan",
        "username": "bsoykan",
        "email": "buraksoykan222@hotmail.com",
        "avatar": "http://127.0.0.1:8000/media/avatars/default.jpg"
    },
    .... burada devamındaki kayıtlı kullanıcıların devamı
]
***

* bu fixlenecek 
# https://localhost:8080/api/user/getuser/<username> GET
- username kısmına kullanıcı adını gönderip fetch atcan kanks
