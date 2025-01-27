export function initLogReg() {
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginWith42 = document.getElementById('42-login');

    // Form Geçişleri
    if (switchToRegister && switchToLogin && loginForm && registerForm && loginWith42) {
        switchToRegister.addEventListener('click', (event) => {
            event.preventDefault();
            loginForm.classList.add('slide-out');
            registerForm.classList.remove('hidden');
            registerForm.classList.add('slide-in');
            setTimeout(() => {
                loginForm.classList.add('hidden');
                loginForm.classList.remove('slide-out');
                registerForm.classList.remove('slide-in');
            }, 200);
        });

        switchToLogin.addEventListener('click', (event) => {
            event.preventDefault();
            registerForm.classList.add('slide-out');
            loginForm.classList.remove('hidden');
            loginForm.classList.add('slide-in');
            setTimeout(() => {
                registerForm.classList.add('hidden');
                registerForm.classList.remove('slide-out');
                loginForm.classList.remove('slide-in');
            }, 200);
        });

        // Giriş Formu İşleme
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const sign = document.getElementById('login-sign').value;
            const password = document.getElementById('login-password').value;

            if (sign && password) {
                try {
                    const response = await fetch('https://localhost:8080/auth/signin/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sign, password }),
                    });
                    if (response.ok) {
                        alert('Giriş başarılı!');
                        const userData = await response.json();
                        console.log(userData);
                    } else {
                        alert('Giriş başarısız!');
                    }
                } catch (err) {
                    console.error('Giriş hatası:', err);
                }
            }
        });

        // Kayıt Formu İşleme
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            if (username && email && password) {
                try {
                    const response = await fetch('https://localhost:8080/auth/signup/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, email, password }),
                    });
                    if (response.ok) {
                        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                        switchToLogin.click();
                    } else {
                        alert('Kayıt başarısız!');
                    }
                } catch (err) {
                    console.error('Kayıt hatası:', err);
                }
            }
        });

        // 42 ile Giriş Yapma
        loginWith42.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = '#api/42-login';
        });
    }
}

// Dinamik script yüklendikten sonra initLogReg fonksiyonunu çağır
document.addEventListener('DOMContentLoaded', initLogReg);


