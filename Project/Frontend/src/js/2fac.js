import { router } from './app.js';

// API yapılandırması: Geliştirme, test ve prod ortamlarında farklı endpoint kullanımı için 
// bu kısmı ortam değişkenleri veya konfigürasyon dosyasından almayı değerlendirin.
const host = window.location.host;

// DOM Elemanları
const form = document.getElementById('onay-form');
const inputs = document.querySelectorAll('.code-inputs input');
const resendButton = document.getElementById('resendCode');
const timerDisplay = document.getElementById('timer');
const countdownSpan = document.getElementById('countdown');

/**
 * 2FA sürecinin başlangıç ayarlarını yapar.
 */
export function init2fac() {
  // Input alanları için davranışları ayarla (sadece rakam, otomatik odak, yapıştırma desteği)
  setupInputHandlers(inputs);
  
  // Form gönderim işlemi
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  // Doğrulama kodu yeniden gönderme butonunun işleyişi
  if (resendButton) {
    resendButton.addEventListener('click', handleResendCode);
  }
  
  // Erişilebilirlik: Hata mesajı alanına ARIA rolü ekleniyor
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.setAttribute('role', 'alert');
  }
}

/**
 * Input alanlarının davranışlarını ayarlar: 
 * - Yalnızca rakam kabul eder
 * - Girildiğinde otomatik sonraki alana geçiş yapar
 * - Backspace ile önceki alana odaklanır
 * - Yapıştırma olayını özel olarak işler
 */
function setupInputHandlers(inputs) {
  inputs.forEach((input, index) => {
    // Yalnızca rakam kabul et
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      if (e.target.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    // Backspace tuşu ile önceki inputa geçiş
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Yapıştırma işlemini yönet
    input.addEventListener('paste', handlePaste);
  });
}

/**
 * Yapıştırılan veriyi sadece rakamlara çevirir ve inputlara sırayla yerleştirir.
 */
function handlePaste(e) {
  e.preventDefault();
  // Yapıştırılan veriden yalnızca rakamları al ve input sayısı kadar kes
  const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, inputs.length);
  
  pasteData.split('').forEach((char, i) => {
    if (i < inputs.length) {
      inputs[i].value = char;
      if (i < inputs.length - 1) {
        inputs[i + 1].focus();
      }
    }
  });
}

/**
 * Form gönderildiğinde doğrulama kodunu sunucuya gönderir.
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  const username = localStorage.getItem("username");
  const verificationCode = Array.from(document.querySelectorAll('.code-inputs input'))
    .map(input => input.value)
    .join('');

  try {
    const response = await submitVerificationCode(username, verificationCode);
    await handleVerificationResponse(response, username);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Doğrulama kodunu API'ye gönderir.
 */
async function submitVerificationCode(username, code) {
  const response = await fetch(`https://${host}/api/auth/twofactor/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, code })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/**
 * Sunucudan dönen doğrulama sonucunu işler.
 * Tokenlar alındığında yerel depolamaya kaydeder ve kullanıcıyı yönlendirir.
 */
async function handleVerificationResponse(data, username) {
  if (!data.data?.message?.access_token || !data.data?.message?.refresh_token) {
    throw new Error("Sunucudan beklenen veri alınamadı!");
  }

  // Güvenlik açısından: Tokenların yönetiminde httpOnly cookie kullanımı tercih edilebilir.
  localStorage.setItem('accessToken', data.data.message.access_token.token);
  localStorage.setItem('refreshToken', data.data.message.refresh_token.token);
  localStorage.setItem('language', 'tr');

  // Başarı durumunda, form gizlenir ve onay mesajı gösterilir.
  document.getElementById('onay-formu').style.display = 'none';
  document.getElementById('onay-mesaji').style.display = 'block';

  // Kısa süre sonra profil sayfasına yönlendirme
  setTimeout(() => {
    history.pushState(null, null, `/profile/${username}`);
    router();
  }, 2000);
}

/**
 * Hata durumlarını yönetir ve kullanıcıya uygun mesaj gösterir.
 */
function handleError(error) {
  console.error('Error:', error);
  const errorElement = document.getElementById('error-message');
  errorElement.style.display = 'flex';
  errorElement.querySelector('span').textContent =
    error.message.includes('Network')
      ? 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.'
      : 'Geçersiz doğrulama kodu. Lütfen tekrar deneyin.';
}

/**
 * Doğrulama kodunun yeniden gönderilmesi için asenkron API çağrısı.
 * async/await kullanılarak daha okunabilir hale getirilmiştir.
 */
async function handleResendCode(e) {
  e.preventDefault();
  const username = localStorage.getItem("username");
  const originalText = resendButton.textContent;
  
  // Buton devre dışı bırakılarak yüklenme durumu gösteriliyor.
  resendButton.textContent = "Gönderiliyor...";
  resendButton.style.pointerEvents = "none";
  
  try {
    const response = await fetch(`https://${host}/api/auth/resend-code/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error("Kod gönderilemedi, lütfen daha sonra tekrar deneyin.");
    }

    if (response.status === 400) {
      showToastMessage("Gönderme süreniz geçmedi. Lütfen daha sonra tekrar deneyin.", true);
    }
    
    await response.json();
    showToastMessage("Doğrulama kodu tekrar gönderildi. Lütfen e-postanızı kontrol edin.");
    startResendTimer();
  } catch (error) {
    console.error("Resend error:", error);
    showToastMessage(error.message, true);
    // Hata durumunda buton eski haline getirilir.
    resendButton.textContent = originalText;
    resendButton.style.pointerEvents = "auto";
  }
}

/**
 * Kullanıcıya toast bildirimleri gösterir.
 */
function showToastMessage(message, isError = false) {
  // Mevcut toast varsa kaldır
  const existingToast = document.querySelector('.toast-message');
  if (existingToast) {
    existingToast.remove();
  }

  // Yeni toast elementi oluşturulur
  const toast = document.createElement('div');
  toast.className = `toast-message ${isError ? 'toast-error' : 'toast-success'}`;
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}" aria-hidden="true"></i>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  // CSS animasyonunu tetikle
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Belirli süre sonra toast kaldırılır
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

/**
 * Doğrulama kodunun yeniden gönderilme süresini kontrol eder.
 */
function startResendTimer() {
  let timeLeft = 60;
  timerDisplay.classList.remove('d-none');
  resendButton.style.display = 'none';

  const timer = setInterval(() => {
    timeLeft--;
    countdownSpan.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      timerDisplay.classList.add('d-none');
      resendButton.style.display = 'inline';
      resendButton.style.pointerEvents = "auto"; // Butonun tekrar tıklanabilir olması
    }
  }, 1000);
}

// DOM yüklendiğinde 2FA işlevleri başlatılır.
document.addEventListener('DOMContentLoaded', init2fac);
