import { router } from "./app.js";
import { showToast } from "/js/profileUI.js";

document.addEventListener('DOMContentLoaded', () => {
    initVerifyEmail();

});

export async function initVerifyEmail(params = {}) {
    const token = params.token;
    const host = window.location.host;
    const apiBaseUrl = `https://${host}/api/`;

    const validate_response = await fetch(`${apiBaseUrl}auth/validate_mail_token/verify/${token}/`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'tr',
        },
    })

    if (validate_response.status !== 200) {
        history.pushState(null, null, "/");
        router();
        return;
    }


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
    showToast(`${prefix}${message}`, type === "success" ? "success" : "danger");
    history.pushState(null, null, "/");
    router();
}

