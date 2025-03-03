import { router } from "/js/app.js";

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
            alert("Please fill in both password fields.");
            return;
        }

        if (pass1 !== pass2) {
            alert("Passwords do not match! Please try again.");
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
                alert("Your password has been successfully reset.");
                history.pushState(null, null, "/");
                router();
            } else if (response.status === 400) {
                alert("Invalid request. Please check your input and try again.");
            } else if (response.status === 401) {
                alert("Unauthorized request. The token may be invalid or expired.");
            } else {
                alert("An unexpected error occurred. Please try again later.");
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
}

