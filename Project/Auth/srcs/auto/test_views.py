import socket

local_ip = socket.gethostbyname(socket.gethostname())
print("Local IP address:", local_ip)
