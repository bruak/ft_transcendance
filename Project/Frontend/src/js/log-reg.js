import { router } from "/js/app.js";

/* ======================[*] Giriş ve Kayıt Sayfasını Başlatma Fonksiyonu [*]====================== */
export function initLogReg() {
    // Core variables
    const host = window.location.host;
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginWith42 = document.getElementById('42-login');

    // Initialize all event listeners
    initKeyboardNavigation();
    initFormSwitching();
    initPasswordToggle();
    initFormValidation();
    init42Login();
    initForgotPassword();
    initFileUpload();

    /**
     * Enter tuşu işlemleri için klavye navigasyonu
     */
    function initKeyboardNavigation() {
        const formContainer = document.getElementById('register-form');
        formContainer.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Sayfanın yenilenmesini engelle

                const currentStepElement = document.querySelector(".form-step-card.active");
                if (!isCurrentStepValid(currentStepElement)) {
                    return;
                }
                nextStep();
            }
        });
    }

    /**
     * Aktif adımın geçerli olup olmadığını kontrol eder
     * @param {HTMLElement} stepElement - Adım elementi
     * @returns {boolean} - Adım geçerli mi
     */
    function isCurrentStepValid(stepElement) {
        const inputFields = stepElement.querySelectorAll("input[required]");
        let isValid = true;

        inputFields.forEach(input => {
            if (input.value.trim() === "") {
                isValid = false;
                showFieldError(input, "Bu alan boş bırakılamaz");
            }
        });

        return isValid;
    }

    /**
     * Form geçiş butonlarının olaylarını tanımlar
     */
    function initFormSwitching() {
        if (switchToRegister && switchToLogin) {
            switchToRegister.addEventListener('click', (event) => {
                event.preventDefault();
                switchForm(loginForm, registerForm);
            });

            switchToLogin.addEventListener('click', (event) => {
                event.preventDefault();
                // Adımları sıfırla
                resetRegistrationForm();
                switchForm(registerForm, loginForm);
            });
        }
    }

    /**
     * Kayıt formunu sıfırlar
     */
    function resetRegistrationForm() {
        currentStep = 0;
        showStep(currentStep);
        updateStepperUI(currentStep);

        // Tüm hata mesajlarını temizle
        document.querySelectorAll('.field-error').forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });

        // Form elemanlarını sıfırla
        registerForm.reset();

        // Avatar önizlemeyi gizle
        document.getElementById('avatar-preview').style.display = 'none';
    }

    /**
     * İki form arasında geçiş yapar
     * @param {HTMLElement} hideForm - Gizlenecek form
     * @param {HTMLElement} showForm - Gösterilecek form
     */
    function switchForm(hideForm, showForm) {
        // Hata mesajlarını temizle
        clearErrors();

        hideForm.classList.add('slide-out');
        showForm.classList.remove('hidden');
        showForm.classList.add('slide-in');

        setTimeout(() => {
            hideForm.classList.add('hidden');
            hideForm.classList.remove('slide-out');
            showForm.classList.remove('slide-in');

            // İlk input alanına odaklanma
            const firstInput = showForm.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 200);
    }

    /**
     * Şifre göster/gizle butonlarını ayarlar
     */
    function initPasswordToggle() {
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('toggle-password')) {
                const targetId = event.target.getAttribute('data-target');
                const passwordField = document.getElementById(targetId);

                if (passwordField.type === 'password') {
                    passwordField.type = 'text';
                    event.target.textContent = 'Gizle';
                    event.target.setAttribute('aria-label', 'Şifreyi gizle');
                } else {
                    passwordField.type = 'password';
                    event.target.textContent = 'Göster';
                    event.target.setAttribute('aria-label', 'Şifreyi göster');
                }
            }
        });
    }

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

            // ARIA erişilebilirlik öznitelikleri güncelle
            if (index === stepIndex) {
                step.removeAttribute('aria-hidden');
            } else {
                step.setAttribute('aria-hidden', 'true');
            }
        });
    }

    function nextStep() {
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
            updateStepperUI(currentStep);

            // Yeni adım görüntülendikten sonra ilk input elemanına odak verelim
            focusFirstInput(currentStep);
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
            updateStepperUI(currentStep);

            // Yeni adım görüntülendikten sonra ilk input elemanına odak verelim
            focusFirstInput(currentStep);
        }
    }

    /**
     * Aktif adımın ilk input alanına odaklanır
     * @param {number} stepIndex - Adım indeksi
     */
    function focusFirstInput(stepIndex) {
        setTimeout(() => {
            const currentStepElement = steps[stepIndex];
            const firstInput = currentStepElement.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 200);
    }

    /**
     * Stepper göstergesini güncelle
     */
    function updateStepperUI(stepIndex) {
        const stepIndicators = document.querySelectorAll(".step");
        stepIndicators.forEach((step, i) => {
            step.classList.toggle("active", i <= stepIndex);
        });

        // ARIA erişilebilirlik öznitelikleri güncelle
        const stepper = document.querySelector('.stepper-container');
        stepper.setAttribute('aria-valuenow', stepIndex + 1);

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
        progressBar.setAttribute('aria-valuenow', progress);
    }

    // İlk yüklendiğinde adım 0
    document.addEventListener("DOMContentLoaded", () => {
        showStep(currentStep);
        updateStepperUI(currentStep);
    });

    /**
     * Form validation işlemleri
     */
    function initFormValidation() {
        // E-mail validasyonu
        const emailInput = document.getElementById('register-email');
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                validateEmail(emailInput);
            });
        }

        // Adım butonları
        setupStepValidation();
    }

    /**
     * Email doğrulaması yapar
     * @param {HTMLInputElement} input - Email input alanı
     * @returns {boolean} - Geçerli mi değil mi
     */
    function validateEmail(input) {
        const emailError = document.getElementById('email-error');
        if (!input.validity.valid) {
            emailError.textContent = 'Lütfen geçerli bir e-posta adresi giriniz';
            emailError.style.display = 'block';
            return false;
        } else {
            emailError.style.display = 'none';
            return true;
        }
    }

    /**
     * Şifre karmaşıklığı kontrolü yapar.
     * Şifre en az 8 karakter, bir küçük harf, bir büyük harf, bir rakam ve bir özel karakter içermelidir.
     * @param {string} password - Girilen şifre
     * @returns {boolean} - Karmaşıksa true, aksi halde false
     */
    function validatePasswordComplexity(input) {
        const regex = /^(?=.*[a-zçğıöşü])(?=.*[A-ZÇĞİÖŞÜ])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-zÇĞİÖŞÜçğıöşü\d@$!%*?&._-]{8,}$/u;


        if (!regex.test(input.value)) {
            showFieldError(input, 'Şifre en az 8 karakter, bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.', 'password-error');
            return false;
        }

        hideFieldError('password-error');
        return true;
    }

    // Kullanıcı şifreyi yazarken anlık validasyon
    document.getElementById('register-password').addEventListener('input', function () {
        validatePasswordComplexity(this);
    });


    /**
     * Adım validasyonları ve buton olaylarını ayarlar
     */
    function setupStepValidation() {
        // Adım 1 (Ad)
        const next1 = document.getElementById('next-1');
        if (next1) {
            next1.addEventListener('click', () => {
                const firstNameInput = document.getElementById('register-first_name');
                if (validateRequired(firstNameInput, 'first-name-error', 'Lütfen adınızı giriniz')) {
                    nextStep();
                }
            });
        }

        // Adım 2 (Soyad)
        const next2 = document.getElementById('next-2');
        const prev2 = document.getElementById('prev-2');
        if (next2) {
            next2.addEventListener('click', () => {
                const lastNameInput = document.getElementById('register-last_name');
                if (validateRequired(lastNameInput, 'last-name-error', 'Lütfen soyadınızı giriniz')) {
                    nextStep();
                }
            });
            prev2.addEventListener('click', prevStep);
        }

        // Adım 3 (Kullanıcı Adı)
        const next3 = document.getElementById('next-3');
        const prev3 = document.getElementById('prev-3');
        if (next3) {
            next3.addEventListener('click', () => {
                const usernameInput = document.getElementById('register-username');
                if (validateRequired(usernameInput, 'username-error', 'Lütfen kullanıcı adınızı giriniz')) {
                    nextStep();
                }
            });
            prev3.addEventListener('click', prevStep);
        }

        // Adım 4 (E-posta)
        const next4 = document.getElementById('next-4');
        const prev4 = document.getElementById('prev-4');
        if (next4) {
            next4.addEventListener('click', () => {
                const emailInput = document.getElementById('register-email');
                if (validateEmail(emailInput) && validateRequired(emailInput, 'email-error', 'Lütfen e-posta adresinizi giriniz')) {
                    nextStep();
                }
            });
            prev4.addEventListener('click', prevStep);
        }

        // Adım 5 (Şifre)
        const next5 = document.getElementById('next-5');
        const prev5 = document.getElementById('prev-5');
        if (next5) {
            next5.addEventListener('click', () => {
                const passwordInput = document.getElementById('register-password');
                const passwordConfirmInput = document.getElementById('register-password-confirm');

                let isValid = validateRequired(passwordInput, 'password-error', 'Lütfen şifrenizi giriniz');
                isValid = validateRequired(passwordConfirmInput, 'password-confirm-error', 'Lütfen şifrenizi tekrar giriniz') && isValid;

                if (isValid) {
                    // Şifre karmaşıklığını element olarak kontrol edelim
                    if (!validatePasswordComplexity(passwordInput)) {
                        return; // Hata mesajı fonksiyonun içinde gösteriliyor
                    }
                    if (passwordInput.value !== passwordConfirmInput.value) {
                        showFieldError(passwordConfirmInput, 'Şifreler eşleşmiyor', 'password-confirm-error');
                        return;
                    }
                    nextStep();
                }
            });
            prev5.addEventListener('click', prevStep);
        }

        // Adım 6 (Profil Fotoğrafı)
        const prev6 = document.getElementById('prev-6');
        if (prev6) {
            prev6.addEventListener('click', prevStep);
        }
    }

    /**
     * Gerekli alan validasyonu yapar
     * @param {HTMLInputElement} input - Input alanı
     * @param {string} errorId - Hata mesajı ID
     * @param {string} message - Hata mesajı
     * @returns {boolean} - Geçerli mi değil mi
     */
    function validateRequired(input, errorId, message) {
        if (!input.value.trim()) {
            showFieldError(input, message, errorId);
            return false;
        }

        hideFieldError(errorId);
        return true;
    }

    /**
     * Alan hatasını gösterir
     * @param {HTMLInputElement} input - Input alanı
     * @param {string} message - Hata mesajı
     * @param {string} errorId - Hata elementi ID
     */
    function showFieldError(input, message, errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        input.classList.add('input-error');
        input.focus();
    }

    /**
     * Alan hatasını gizler
     * @param {string} errorId - Hata elementi ID
     */
    function hideFieldError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * Tüm hata mesajlarını temizler
     */
    function clearErrors() {
        document.querySelectorAll('.field-error').forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });

        document.querySelectorAll('.error-container').forEach(container => {
            container.innerHTML = '';
        });

        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('input-error');
        });
    }

    /**
     * Form hata mesajını gösterir
     * @param {string} containerId - Konteyner ID
     * @param {string} message - Hata mesajı
     */
    function showFormError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `<div class="error-message">${message}</div>`;
    }

    /**
     * Dosya yükleme işlemlerini ayarlar 
     */
    function initFileUpload() {
        document.getElementById("register-avatar").addEventListener("change", function (event) {
            const file = event.target.files[0];
            const errorElement = document.getElementById('avatar-error');

            if (!file) return;

            // Dosya türünü kontrol et
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                errorElement.textContent = 'Lütfen geçerli bir resim dosyası seçin (JPG, JPEG, PNG).';
                errorElement.style.display = 'block';
                this.value = '';
                return;
            }

            // Dosya boyutunu kontrol et
            const maxSize = 2 * 1024 * 1024; // 2 MB
            if (file.size > maxSize) {
                errorElement.textContent = 'Resmin boyutu 2MB\'yi aşamaz.';
                errorElement.style.display = 'block';
                this.value = '';
                return;
            }

            // Hata mesajını temizle
            errorElement.style.display = 'none';

            // Resmi önizle
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.getElementById("avatar-preview");
                img.classList.remove("d-none"); // Bootstrap ile görünür yap
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    /* ======================[*] Giriş Formu İşleme [*]====================== */
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const sign = document.getElementById('login-sign').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = document.getElementById('login-submit-btn');
            const errorContainer = document.getElementById('login-error-container');

            errorContainer.innerHTML = '';

            if (!sign || !password) {
                showFormError('login-error-container', 'Kullanıcı adı ve şifre alanları zorunludur.');
                return;
            }

            localStorage.setItem("username", sign);

            // Loading deneyimi
            submitBtn.disabled = true;
            submitBtn.textContent = 'Giriş Yapılıyor...';
            submitBtn.classList.add('loading');

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

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol ediniz.");
                }


                history.pushState(null, null, "/2fac");  // Giriş yaptıktan sonra yönlendirilen sayfa
                router();
            } catch (error) {
                console.error("Hata:", error);
                showFormError('login-error-container', error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Giriş Yap';
                submitBtn.classList.remove('loading');
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
            const errorContainer = document.getElementById('register-error-container');

            errorContainer.innerHTML = '';

            // Form geçerliliğini kontrol et
            let isFormValid = true;
            if (!firstName) {
                showFieldError(document.getElementById('register-first_name'), 'Ad alanı zorunludur', 'first-name-error');
                isFormValid = false;
            }

            if (!lastName) {
                showFieldError(document.getElementById('register-last_name'), 'Soyad alanı zorunludur', 'last-name-error');
                isFormValid = false;
            }

            if (!username) {
                showFieldError(document.getElementById('register-username'), 'Kullanıcı adı alanı zorunludur', 'username-error');
                isFormValid = false;
            }

            if (!email || !validateEmail(document.getElementById('register-email'))) {
                showFieldError(document.getElementById('register-email'), 'Geçerli bir e-posta adresi giriniz', 'email-error');
                isFormValid = false;
            }

            if (!password) {
                showFieldError(document.getElementById('register-password'), 'Şifre alanı zorunludur', 'password-error');
                isFormValid = false;
            } else if (!validatePasswordComplexity(document.getElementById('register-password'))) {
                showFieldError(document.getElementById('register-password'), 'Şifre en az 8 karakter, bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.', 'password-error');
                isFormValid = false;
            }

            if (!avatar) {
                showFieldError(document.getElementById('register-avatar'), 'Profil fotoğrafı zorunludur', 'avatar-error');
                isFormValid = false;
            }

            if (!isFormValid) {
                return;
            }

            // Loading deneyimi
            submitBtn.disabled = true;
            submitBtn.textContent = 'Kayıt Yapılıyor...';
            submitBtn.classList.add('loading');

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

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Kayıt yapılamadı. Lütfen bilgilerinizi kontrol ediniz.");
                }

                // Kayıt başarılıysa giriş formuna dön
                switchToLogin.click();
            } catch (error) {
                console.error("Hata:", error);
                showFormError('register-error-container', error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Kayıt Ol';
                submitBtn.classList.remove('loading');
            }
        });
    }

    /* ======================[*] 42 ile Giriş Yapma [*]====================== */
    function init42Login() {
        document.getElementById("42login").addEventListener("click", async function () {
            const host = window.location.host;
            const apiBaseUrl = `https://${host}/api/`;

            try {
                // API'den URL'yi alıyoruz
                const response = await fetch(`${apiBaseUrl}auth/intra/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Accept-Language': localStorage.getItem('language') || 'tr',
                    }
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.error}`);
                }

                const responseJson = await response.json();
                const popup = createPopup(responseJson.message.url);
                await closePopup(popup);
            } catch (error) {
                console.error("Hata:", error);
                showFormError('login-error-container', 'Giriş yapılamadı. Lütfen tekrar deneyiniz.');
            }
        });
    }

    // Pop-up'tan İstek Gönderme
    async function closePopup(popup) {
        const host = window.location.host;
        const apiBaseUrl = `https://${host}/api/`;

        const timer = setInterval(async function () {
            try {
                if (!popup || popup.closed) {
                    clearInterval(timer);
                    return;
                }

                const urlParams = new URLSearchParams(popup.location.search);
                const code = urlParams.get("code");

                if (code) {
                    clearInterval(timer);
                    popup.close();

                    try {
                        const responseCallback = await fetch(`${apiBaseUrl}auth/callback/?code=${code}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Accept-Language": "tr",
                            },
                        });

                        if (!responseCallback.ok) {
                            throw new Error(`Callback Error: ${responseCallback.status}`);
                        }

                        const data = await responseCallback.json();
                        const { access_token, refresh_token, username } = data.data;

                        // Verileri localStorage'a kaydediyoruz
                        localStorage.setItem('accessToken', access_token.token);
                        localStorage.setItem('refreshToken', refresh_token.token);
                        localStorage.setItem('username', username);
                        localStorage.setItem('language', 'tr');

                        window.location.href = `/profile/${username}`;
                    } catch (error) {
                        console.error("Callback Error:", error);
                        showFormError('login-error-container', 'Giriş yapılamadı. Lütfen tekrar deneyiniz.');
                    }
                }
            } catch (error) {
                // Bu hata genellikle farklı origin'den okuma yapmaya çalıştığımızda oluşur
                // Popup kapatılana kadar kontrol etmeye devam et
            }
        }, 1000);
    }

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

    /* ======================[*] Şifremi Unuttum! [*]====================== */
    function initForgotPassword() {
        const forgotpswd = document.querySelector('#forgot-password a');

        if (forgotpswd) {
            forgotpswd.addEventListener('click', (event) => {
                event.preventDefault();
                history.pushState(null, null, "/recover-password");
                router();
            });
        }
    }
}


