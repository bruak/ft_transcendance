// Giriş ve Kayıt Formlarını Başlatma Fonksiyonu
function initializeLogReg() {
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginWith42 = document.getElementById('42ile');

    // Kayıt formuna geçiş
    if (switchToRegister && loginForm && registerForm) {
        switchToRegister.addEventListener('click', function(event) {
            event.preventDefault();
            loginForm.classList.add('slide-out');
            registerForm.classList.remove('hidden');
            registerForm.classList.add('slide-in');
            setTimeout(function() {
                loginForm.classList.add('hidden');
                loginForm.classList.remove('slide-out');
            }, 500);
        });
    }

    // Giriş formuna geçiş
    if (switchToLogin && loginForm && registerForm) {
        switchToLogin.addEventListener('click', function(event) {
            event.preventDefault();
            registerForm.classList.add('slide-out');
            loginForm.classList.remove('hidden');
            loginForm.classList.add('slide-in');
            setTimeout(function() {
                registerForm.classList.add('hidden');
                registerForm.classList.remove('slide-out');
            }, 500);
        });
    }

    // 42 ile giriş yapma
    if (loginWith42) {
        loginWith42.addEventListener('click', async function(event) {
            event.preventDefault();
            try {
                window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code';
            } catch (err) {
                console.error('42 ile giriş yapılırken bir hata oluştu:', err);
            }

        });
    }
}

// Dinamik script yüklendikten sonra initializeLogReg fonksiyonunu çağır
initializeLogReg();

export { initializeLogReg as initLogReg };


