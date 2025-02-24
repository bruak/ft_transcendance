document.addEventListener('DOMContentLoaded', () => {
    initPassword();
});

export async function initPassword(params = {}) {
    console.log(params.token)
    const token = params.token

    const pass1 = document.getElementById('newPassword').value
    const pass2 = document.getElementById('confirmPassword').value
    
    document.getElementById('reset-password').addEventListener('click', async () => {
        event.preventDefault()
        
		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

        const pass1 = document.getElementById('newPassword').value;
        const pass2 = document.getElementById('confirmPassword').value;
        
        const requestData = {
			token: token,
			password: pass1,
		};

        if (pass1 === pass2) {
            alert("Passwords match! Proceeding with password reset.");
            const response = await fetch(`${apiBaseUrl}auth/reset_password/${token}/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
			        'Accept-Language': 'tr',
                },
                body: JSON.stringify(requestData)
            });
            alert(response.status)
        } else {
            alert("Passwords do not match! Please try again.");
        }
    });
    
    
}
