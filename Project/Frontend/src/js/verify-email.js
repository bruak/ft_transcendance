import { router } from "./app.js";

document.addEventListener('DOMContentLoaded', () => {
    initVerifyEmail();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        initVerifyEmail({ token });
    } else {
        showMessage("Hata: Doğrulama bağlantısında eksik veya geçersiz bir token var.", "error");
    }
});

export async function initVerifyEmail(params = {}) {
    const token = params.token;
    const host = window.location.host;
    const apiBaseUrl = `https://${host}/api/`;

    try {
        const response = await fetch(`${apiBaseUrl}auth/verify-account/${token}/`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'tr',
            },
        });

        if (response.status === 200) {
            showMessage("Hesabınız başarıyla doğrulandı. Ana sayfaya yönlendiriliyorsunuz...", "success");
        } else if (response.status === 400) {
            const errorData = await response.json();
            showMessage(`Hata: ${errorData.message || "Doğrulama sırasında bir sorun oluştu."}`, "error");
        } else if (response.status === 404) {
            showMessage("Hata: Doğrulama bağlantısı bulunamadı veya geçersiz.", "error");
        } else {
            showMessage("Hata: Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.", "error");
        }
    } catch (error) {
        showMessage(`Hata: Doğrulama sırasında bir sorun oluştu. (${error.message})`, "error");
    }
}

function showMessage(message, type) {
    const prefix = type === "success" ? "Success: " : "Error: ";
    alert(`${prefix}${message}`);
    history.pushState(null, null, "/");
    router();
}

