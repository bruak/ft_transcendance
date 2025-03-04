import { router } from "/js/app.js";


export async function initRecoverPassword() {
    const host = window.location.host;
    const apiBaseUrl = `https://${host}/api/`;
    const messageElement = document.getElementById("message");

    const showMessage = (text, isSuccess = true) => {
        messageElement.textContent = text;
        messageElement.className = `text-center mt-3 ${isSuccess ? 'text-success' : 'text-danger'}`;
        messageElement.style.display = "block";
    };

    document.getElementById('recover-password').addEventListener('click', async (event) => {
        event.preventDefault();
        messageElement.style.display = "none"; // Mesajı sıfırla
        const username = document.getElementById('username').value;

        if (!username) {
            showMessage("Lütfen kullanıcı adınızı girin.", false);
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}auth/userexists/${username}/`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': 'en',
                },
            });

            if (response.status === 200) {
                const responseMail = await fetch(`${apiBaseUrl}auth/forget_password/${username}/`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': 'en',
                    },
                });

                if (responseMail.status === 200) {
                    showMessage("Şifre sıfırlama linki e-posta adresinize gönderildi!");
                    setTimeout(() => {
                        history.pushState(null, null, "/");
                        router();
                    }, 3000); // 3 saniye sonra yönlendirme
                } else {
                    showMessage("E-posta gönderilemedi. Lütfen tekrar deneyin.", false);
                }
            } else if (response.status === 404) {
                showMessage("Hata: Kullanıcı adı bulunamadı.", false);
            } else {
                showMessage("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.", false);
            }
        } catch (error) {
            showMessage(`Hata: ${error.message}`, false);
        }
    });
}
