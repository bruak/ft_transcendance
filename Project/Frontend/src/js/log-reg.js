/* ======================[*] Giriş ve Kayıt Sayfasını Başlatma Fonksiyonu [*]====================== */
export function initLogReg() {
    const host = window.location.host;
    console.log(host);
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginWith42 = document.getElementById('42-login');

    function switchForm(hideForm, showForm) {
        hideForm.classList.add('slide-out');
        showForm.classList.remove('hidden');
        showForm.classList.add('slide-in');
        setTimeout(() => {
            hideForm.classList.add('hidden');
            hideForm.classList.remove('slide-out');
            showForm.classList.remove('slide-in');
        }, 200);
    }

    /* ======================[*] Form Geçişleri [*]====================== */
    if (switchToRegister && switchToLogin && loginForm && registerForm && loginWith42) {
        switchToRegister.addEventListener('click', (event) => {
            event.preventDefault();
            switchForm(loginForm, registerForm);
        });

        switchToLogin.addEventListener('click', (event) => {
            event.preventDefault();
            switchForm(registerForm, loginForm);
        });

        /* 42 ile giriş */
        document.getElementById("42login").addEventListener("click", async function() {
            const host = window.location.host;
            const apiBaseUrl = `https://${host}/api/`;
        
            try {
                // API'den URL'yi alıyoruz
                const response = await fetch(`${apiBaseUrl}auth/intra/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Accept-Language': localStorage.getItem('language'),
                    }
                });
        
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }
        
                // API'den dönen JSON verisini işliyoruz
                const responseJson = await response.json();
        
                // Pop-up'ı açıyoruz
                const popup = createPopup(responseJson.message.url);
                
                // İhtiyaç duyulursa, pop-up ayarlarını kapatma fonksiyonu ekleyebilirsiniz
                const data = await getPopupData(popup);
                console.log("Pop-up'tan gelen veri:", data);
                
                // Elde edilen JSON verisini localStorage'da saklama
                const { access_token, refresh_token, username} = data.data;
                localStorage.setItem('accessToken', access_token.token);
                localStorage.setItem('refreshToken', refresh_token.token);
                localStorage.setItem('username', username)
                localStorage.setItem('language', 'tr');
                console.log(access_token.token)
                window.location.href = `/${username}`;
        
        
            } catch (error) {
                console.error("Hata:", error);  // Hata durumunda yazdır
                Toast({
                    title: "Error",
                    message: error.message,
                    theme: "danger",
                });
            }
        });
        
        // Pop-up oluşturma fonksiyonu
        function createPopup(url) {
            const popupWidth = 600;
            const popupHeight = 600;
            const left = (window.innerWidth - popupWidth) / 2;
            const top = (window.innerHeight - popupHeight) / 2;
        
            return window.open(
                url,
                "OAuth2 Login",
                `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
            );
        }
        
        // Pop-up'tan veri almak için kullanılan fonksiyon
        async function getPopupData(popup) {
            return new Promise((resolve, reject) => {
                const timer = setInterval(function () {
                    try {
                        if (popup.closed) {
                            clearInterval(timer); // Pop-up kapatıldığında interval'i durduruyoruz
                            reject(new Error("Pop-up kapatıldı."));
                            return;
                        }
        
                        // Pop-up'ın içeriğini kontrol ediyoruz
                        if (popup.document.readyState === 'complete') {
                            try {
                                // İçeriği JSON olarak işleme
                                const jsonResponse = popup.document.body.innerText.trim(); // İçeriği al
                                let data;
        
                                if (jsonResponse.startsWith("{") && jsonResponse.endsWith("}")) {
                                    // JSON formatında ise doğrudan parse et
                                    data = JSON.parse(jsonResponse);
                                    clearInterval(timer); // Interval'i durdur
                                    popup.close(); // Pop-up'ı kapat
                                    resolve(data);  // JSON verisini döndür
                                }
               
                            } catch (error) {
                                console.error("Pop-up içeriği JSON verisi değil:", error);
                            }
                        }
                    } catch (error) {
                        console.error("Error in getPopupData:", error);
                    }
                }, 1000); // Her saniye kontrol eder
            });
        }

        
        
        
        /* ======================[*] Giriş Formu İşleme [*]====================== */
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
                        const errorData = await response.json().catch(() => null);
                        throw new Error(errorData?.message || "Authentication failed in sing in js");
                    }
                    const data = await response.json();

                    alert(data.message); // its came from backend
                    if (response.ok) {
                        window.location.href = "/2fac";  // Giriş yaptıktan sonra yönlendirilen sayfa.
                    }

                } catch (error) {
                    console.error("Hata:", error);
                    alert(error.message);
                }
            }
        });

        /* ======================[*] Kayıt Formu İşleme [*]====================== */
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
                        headers: { 'Accept': 'application/json', 'Accept-Language': 'tr' },
                        body: formData,
                    });
                    if (response.ok) {
                        console.error('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                        switchToLogin.click();
                    } else {
                        console.error('Kayıt başarısız!');
                        console.error(response.status);
                    }
                } catch (err) {
                    console.error('Kayıt hatası:', err);
                }
            }
        });

     
    }
}

/* ======================[*] Dinamik Script Yüklendikten Sonra initLogReg Fonksiyonunu Çağır [*]====================== */
document.addEventListener('DOMContentLoaded', initLogReg);


