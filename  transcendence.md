# Auth Service

# https://localhost:8080/api/auth/singup/ POST
- Giden Veri FormData Türünde Olucak ve File Göndericek
- Headers   "Content-Type": "multipart/form-data", "Accept": "application/json",   "Accept-Language": "tr",
- first_name (Text)
- last_name (Text)
- username (Text)
- email (Text)
- password (Text)
- avatar (File)

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




