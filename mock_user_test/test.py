import requests
from time import sleep

i = 0
while True:
    url = "https://localhost:8000/api/auth/singup/"  # Target URL

    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "tr",
        "Connection": "keep-alive",
        "Origin": "https://localhost:8000",
        "Referer": "https://localhost:8000/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133")',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
    }

    payload = {
        "first_name": f"assd{i}",
        "last_name": f"assd{i}",
        "username": f"assd{i}",
        "email": f"asdsd{i}@asad.com",
        "password": f"assaddasd{i}",
    }

    # Open the image as binary
    with open("image.jpg", "rb") as img_file:
        files = {
            "avatar": ("image.jpg", img_file, "image/jpg")  # (File name, File binary, MIME type)
        }

        # Send POST request with both form data and the file
        response = requests.post(url, headers=headers, data=payload, files=files, verify=False)

    i += 1

    print("Status Code:", response.status_code)
    print("Response:", response.text)

    sleep(1)  # Adding a small delay to avoid spamming the server too quickly
