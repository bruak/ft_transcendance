import { router } from "./app.js";

/* ======================[*] Giriş ve Kayıt Sayfasını Başlatma Fonksiyonu [*]====================== */
export function initLogReg() {
    const host = window.location.host;
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginWith42 = document.getElementById('42-login');

    /* ======================[*] ENTER TUŞUNA BASILDIĞINDA SONRAKİ ADIMA GEÇ [*]====================== */
    const formContainer = document.getElementById('register-form');
    formContainer.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Sayfanın yenilenmesini engelle
            
            const currentStepElement = document.querySelector(".form-step-card.active");
            const inputFields = currentStepElement.querySelectorAll("input");

            // Boş alan olup olmadığını kontrol et
            let isEmpty = false;
            inputFields.forEach(input => {
                if (input.value.trim() === "") {
                    isEmpty = true;
                }
            });

            // Eğer boş alan yoksa bir sonraki adıma geç
            if (!isEmpty) {
                nextStep();
            }
        }
    });

    


    /* Adım kartları */
    const steps = document.querySelectorAll(".form-step-card");
    let currentStep = 0;

    /**
     * Adım geçişlerini kontrol eden fonksiyonlar
     */
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle("active", index === stepIndex);
            step.classList.toggle("hidden", index !== stepIndex);
        });
    }

    function nextStep() {
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
            updateStepperUI(currentStep);
            // Yeni adım görüntülendikten sonra ilk input elemanına odak verelim
            setTimeout(() => {
                const currentStepElement = steps[currentStep];
                const firstInput = currentStepElement.querySelector('input');
                if (firstInput) {
                firstInput.focus();
                }
            }, 200);
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
            updateStepperUI(currentStep);
        }
    }

    /**
     * Stepper göstergesini güncelle
     */
    function updateStepperUI(stepIndex) {
        const stepIndicators = document.querySelectorAll(".step");
        stepIndicators.forEach((step, i) => {
            step.classList.toggle("active", i <= stepIndex);
        });
        updateProgressBar(stepIndex);
    }

    /**
     * Progres bar'ı güncelle
     */
    function updateProgressBar(stepIndex) {
        const progressBar = document.getElementById('progress-bar');
        if (!progressBar) return;

        // Toplam 6 adım var
        const totalSteps = 6; 
        const progress = ((stepIndex + 1) / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // İlk yüklendiğinde adım 0
    document.addEventListener("DOMContentLoaded", () => {
        showStep(currentStep);
        updateStepperUI(currentStep);
    });

    /**
     * İki form arasında geçiş yap (giriş/kayıt)
     */
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

    /**
     * Şifre göster/gizle fonksiyonu
     */
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('toggle-password')) {
            const targetId = event.target.getAttribute('data-target');
            const passwordField = document.getElementById(targetId);
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                event.target.textContent = 'Gizle';
            } else {
                passwordField.type = 'password';
                event.target.textContent = 'Göster';
            }
        }
    });

    /**
     * E-posta alanı için basit validasyon örneği
     */
    const emailInput = document.getElementById('register-email');
    const emailError = document.getElementById('email-error');
    if (emailInput && emailError) {
        emailInput.addEventListener('input', () => {
            if (!emailInput.validity.valid) {
                emailError.style.display = 'block';
            } else {
                emailError.style.display = 'none';
            }
        });
    }

    /* ======================[*] Form Geçiş Butonları [*]====================== */
    if (switchToRegister && switchToLogin) {
        switchToRegister.addEventListener('click', (event) => {
            event.preventDefault();
            switchForm(loginForm, registerForm);
        });

        switchToLogin.addEventListener('click', (event) => {
            event.preventDefault();
            // Adımları sıfırla
            currentStep = 0;
            showStep(currentStep);
            updateStepperUI(currentStep);
            switchForm(registerForm, loginForm);
        });
    }

    /**
     * Kayıt formu adımları (ileri/geri) validasyonu
     */
    const next1 = document.getElementById('next-1');
    const next2 = document.getElementById('next-2');
    const next3 = document.getElementById('next-3');
    const next4 = document.getElementById('next-4');
    const next5 = document.getElementById('next-5');
    const prev2 = document.getElementById('prev-2');
    const prev3 = document.getElementById('prev-3');
    const prev4 = document.getElementById('prev-4');
    const prev5 = document.getElementById('prev-5');
    const prev6 = document.getElementById('prev-6');

    // Adım 1 (Ad)
    if (next1) {
        next1.addEventListener('click', () => {
            const firstName = document.getElementById('register-first_name').value.trim();
            if (!firstName) {
                alert("Lütfen isminizi girin.");
                return;
            }
            nextStep();
        });
    }

    // Adım 2 (Soyad)
    if (next2) {
        next2.addEventListener('click', () => {
            const lastName = document.getElementById('register-last_name').value.trim();
            if (!lastName) {
                alert("Lütfen soyadınızı girin.");
                return;
            }
            nextStep();
        });
        prev2.addEventListener('click', () => prevStep());
    }

    // Adım 3 (Kullanıcı Adı)
    if (next3) {
        next3.addEventListener('click', () => {
            const username = document.getElementById('register-username').value.trim();
            if (!username) {
                alert("Lütfen kullanıcı adınızı girin.");
                return;
            }
            nextStep();
        });
        prev3.addEventListener('click', () => prevStep());
    }

    // Adım 4 (E-posta)
    if (next4) {
        next4.addEventListener('click', () => {
            const email = document.getElementById('register-email').value.trim();
            // Basit kontrol: HTML5 validasyonu da var, ama yine de kontrol edebiliriz
            if (!email || !emailInput.validity.valid) {
                alert("Lütfen geçerli bir e-posta giriniz.");
                return;
            }
            nextStep();
        });
        prev4.addEventListener('click', () => prevStep());
    }

    // Adım 5 (Şifre)
    if (next5) {
        next5.addEventListener('click', () => {
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm').value;
            if (!password || !passwordConfirm) {
                alert("Lütfen şifre alanlarını boş bırakmayın.");
                return;
            }
            if (password !== passwordConfirm) {
                alert("Şifreler eşleşmiyor!");
                return;
            }
            nextStep();
        });
        prev5.addEventListener('click', () => prevStep());
    }

    // Adım 6 (Profil Fotoğrafı)
    if (prev6) {
        prev6.addEventListener('click', () => prevStep());
    }

    /* ======================[*] Giriş Formu İşleme [*]====================== */
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const sign = document.getElementById('login-sign').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = document.getElementById('login-submit-btn');

            localStorage.setItem("username", sign);

            if (sign && password) {
                // Loading deneyimi
                submitBtn.disabled = true;
                submitBtn.textContent = 'Giriş Yapılıyor...';

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
                        throw new Error(errorData?.message || "Authentication failed");
                    }

                    const data = await response.json();
                    console.log(data.message); // Backend'den gelen mesaj

                    if (response.ok) {
                        history.pushState(null, null, "/2fac");  // Giriş yaptıktan sonra yönlendirilen sayfa
                        router();
                    }
                } catch (error) {
                    console.error("Hata:", error);
                    alert(error.message);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Giriş Yap';
                }
            }
        });
    }

    /* ======================[*] Kayıt Formu İşleme [*]====================== */
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const firstName = document.getElementById('register-first_name').value;
            const lastName = document.getElementById('register-last_name').value;
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const avatar = document.getElementById('register-avatar').files[0];
            const submitBtn = document.getElementById('register-submit-btn');

            if (firstName && lastName && username && email && password && avatar) {
                // Loading deneyimi
                submitBtn.disabled = true;
                submitBtn.textContent = 'Kayıt Yapılıyor...';

                const formData = new FormData();
                formData.append('first_name', firstName);
                formData.append('last_name', lastName);
                formData.append('username', username);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('avatar', avatar);

                try {
                    const response = await fetch(`https://${host}/api/auth/singup/`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Accept-Language': 'tr'
                            // 'Content-Type' atanmıyor, FormData kullanıyoruz
                        },
                        body: formData,
                    });

                    if (response.ok) {
                        console.log('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                        // Kayıt başarılıysa giriş formuna dön
                        switchToLogin.click();
                    } else {
                        console.error('Kayıt başarısız! Durum Kodu:', response.status);
                    }
                } catch (err) {
                    console.error('Kayıt hatası:', err);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Kayıt Ol';
                }
            }
        });
    }


    /* ======================[*] 42 ile Giriş Yapma [*]====================== */
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
            history.pushState(null, null, `/${username}`)
		    router()
    
    
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
}

/* ======================[*] Sayfa Yüklendiğinde initLogReg Fonksiyonunu Çağır [*]====================== */
document.addEventListener('DOMContentLoaded', initLogReg);
