import { router } from "/js/app.js";
import { showToast } from "/js/profileUI.js";

document.addEventListener('DOMContentLoaded', () => {
    initPassword();
});

export async function initPassword(params = {}) {
    const host = window.location.host;
    const apiBaseUrl = `https://${host}/api/`;
    
    const token = params.token;
    const validate_response = await fetch(`${apiBaseUrl}auth/validate_mail_token/forgot-password/${token}/`, {
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


    document.getElementById('reset-password').addEventListener('click', async (event) => {
        event.preventDefault();

        const pass1 = document.getElementById('newPassword').value;
        const pass2 = document.getElementById('confirmPassword').value;

        if (!pass1 || !pass2) {
            showToast("Please fill in both password fields.", "danger");
            return;
        }

        if (pass1 !== pass2) {
            showToast("Passwords do not match! Please try again.", "danger");
            return;
        }

        const requestData = {
            token: token,
            password: pass1,
        };

        try {
            const response = await fetch(`${apiBaseUrl}auth/reset_password/${token}/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': 'en',
                },
                body: JSON.stringify(requestData),
            });

            if (response.status === 200) {
                showToast("Your password has been successfully reset.");
                history.pushState(null, null, "/");
                router();
            } else if (response.status === 400) {
                showToast("Invalid request. Please check your input and try again.", "danger");
            } else if (response.status === 401) {
                showToast("Unauthorized request. The token may be invalid or expired.", "danger");
            } else {
                showToast("An unexpected error occurred. Please try again later.", "danger");
            }
        } catch (error) {
            showToast(`Error: ${error.message}`, "danger");
        }
    });
}

