export function initLogReg() {
    const host = window.location.host;
    console.log(host)
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

            localStorage.setItem("username", sign);

            if (sign && password) {
                try {
                    const response = await fetch(`https://${host}/api/auth/singin/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Accept-Language': 'tr'
                        },
                        body: JSON.stringify({ sign, password }),
                    });

                    if (!response.ok) {
                        alert('response not ok');
                        const errorData = await response.json().catch(() => null);
                        throw new Error(errorData?.message || "Authentication failed in sing in js");
                    }
                    const data = await response.json();

                    alert(data.message); // its came from backend
                    // Burada örnek olarak token'ı yerel depolamaya kaydediyoruz
                    //localStorage.setItem("authToken", data.token);  // Bu, örnek bir işlemdir; yanıt formatına göre özelleştirilebilir.

                    // Kullanıcıyı yönlendirme veya başka bir işlem
                    if (response.ok) {
                        window.location.href = "/2fac";  // Giriş yaptıktan sonra yönlendirilen sayfa.
                    }

                } catch (error) {
                    console.error("Hata:", error);
                    // Kullanıcıya hata mesajını gösterebilirsiniz
                    alert(error.message);
                }
            }
        });

        // Kayıt Formu İşleme
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const firstName = document.getElementById('register-first_name').value;
            const lastName = document.getElementById('register-last_name').value;
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const avatar = document.getElementById('register-avatar').files[0];

            if (firstName && lastName && username && email && password && avatar) {
                const formData = new FormData();
                formData.append('first_name', firstName);
                formData.append('last_name', lastName);
                formData.append('username', username);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('avatar', avatar);
                console.log(password);
                try {
                    const response = await fetch(`https://${host}/api/auth/singup/`, {
                        method: 'POST',
                        headers: { 'Accept': 'application/json', 'Accept-Language': 'tr' }, // ✅ "Content-Type" KALDIRILDI!
                        body: formData,
                    });
                    if (response.ok) {
                        console.error('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                        switchToLogin.click();
                    } else {
                        console.error('Kayıt başarısız!');
                        console.error(response.status)
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


