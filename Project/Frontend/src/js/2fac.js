import { router } from './app.js';

const host = window.location.host;
const form = document.getElementById('onay-form');
const inputs = document.querySelectorAll('.code-inputs input');
const resendButton = document.getElementById('resendCode');
const timerDisplay = document.getElementById('timer');
const countdownSpan = document.getElementById('countdown');
export function init2fac() {

  // Input handling
  setupInputHandlers(inputs);

  // Form submission
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Resend code functionality
  if (resendButton) {
    resendButton.addEventListener('click', handleResendCode);
  }
}

function setupInputHandlers(inputs) {
  inputs.forEach((input, index) => {
    // Only allow numbers
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');

      if (e.target.value.length === 1) {
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      }
    });

    // Handle backspace
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Handle paste
    input.addEventListener('paste', handlePaste);
  });
}

function handlePaste(e) {
  e.preventDefault();
  const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
  const inputs = document.querySelectorAll('.code-inputs input');

  pasteData.split('').forEach((char, i) => {
    if (i < inputs.length) {
      inputs[i].value = char;
      if (i < inputs.length - 1) {
        inputs[i + 1].focus();
      }
    }
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const username = localStorage.getItem("username");
  const verificationCode = [...document.querySelectorAll('.code-inputs input')]
    .map(input => input.value)
    .join('');

  try {
    const response = await submitVerificationCode(username, verificationCode);
    await handleVerificationResponse(response, username);
  } catch (error) {
    handleError(error);
  }
}

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

async function handleVerificationResponse(data, username) {
  if (!data.data?.message?.access_token || !data.data?.message?.refresh_token) {
    throw new Error("Sunucudan beklenen veri alınamadı!");
  }

  // Store tokens
  localStorage.setItem('accessToken', data.data.message.access_token.token);
  localStorage.setItem('refreshToken', data.data.message.refresh_token.token);
  localStorage.setItem('language', 'tr');

  // Show success message and redirect
  document.getElementById('onay-formu').style.display = 'none';
  document.getElementById('onay-mesaji').style.display = 'block';

  // Redirect after a short delay
  setTimeout(() => {
    history.pushState(null, null, `/profile/${username}`);
    router();
  }, 2000);
}

function handleError(error) {
  console.error('Error:', error);
  const errorElement = document.getElementById('error-message');

  errorElement.style.display = 'flex';
  errorElement.querySelector('span').textContent =
    error.message.includes('Network')
      ? 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.'
      : 'Geçersiz doğrulama kodu. Lütfen tekrar deneyin.';
}

function handleResendCode(e) {
  e.preventDefault();
  const username = localStorage.getItem("username");

  // Buttonu devre dışı bırak ve yükleniyor göster
  const resendButton = document.getElementById('resendCode');
  const originalText = resendButton.textContent;
  resendButton.textContent = "Gönderiliyor...";
  resendButton.style.pointerEvents = "none";

  // API isteği gönder
  fetch(`https://${host}/api/auth/resend-code/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Kod gönderilemedi, lütfen daha sonra tekrar deneyin.");
      }
      return response.json();
    })
    .then(data => {
      // Başarılı olduğunda toast mesajı göster
      showToastMessage("Doğrulama kodu tekrar gönderildi. Lütfen e-postanızı kontrol edin.");

      // Sayacı başlat
      startResendTimer();
    })
    .catch(error => {
      console.error("Resend error:", error);
      showToastMessage(error.message, true);

      // Hata durumunda butonu eski haline getir
      resendButton.textContent = originalText;
      resendButton.style.pointerEvents = "auto";
    });
}

// Toast mesajı gösterme fonksiyonu
function showToastMessage(message, isError = false) {
  // Eğer mevcut bir toast varsa, kaldır
  const existingToast = document.querySelector('.toast-message');
  if (existingToast) {
    existingToast.remove();
  }

  // Yeni toast oluştur
  const toast = document.createElement('div');
  toast.className = `toast-message ${isError ? 'toast-error' : 'toast-success'}`;
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
      <span>${message}</span>
    </div>
  `;

  // Toast'ı sayfaya ekle
  document.body.appendChild(toast);

  // Toast'ı göster ve animasyon ekle
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Belirli süre sonra toast'ı kaldır
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

function startResendTimer() {
  let timeLeft = 60;
  const timerDisplay = document.getElementById('timer');
  const countdownSpan = document.getElementById('countdown');
  const resendButton = document.getElementById('resendCode');

  timerDisplay.classList.remove('d-none');
  resendButton.style.display = 'none';

  const timer = setInterval(() => {
    timeLeft--;
    countdownSpan.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      timerDisplay.classList.add('d-none');
      resendButton.style.display = 'inline';
    }
  }, 1000);
}

document.addEventListener('DOMContentLoaded', init2fac);
