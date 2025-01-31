export function init2fac() {
  const host = window.location.host;

  const inputs = document.querySelectorAll('.split_input_item input');
  inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      if (input.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && input.value.length === 0 && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  document.getElementById('onay-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = localStorage.getItem("username");
    console.log("KULLANICI ADI", username);
    const verificationCode = [
      document.getElementById('digit-1').value,
      document.getElementById('digit-2').value,
      document.getElementById('digit-3').value,
      document.getElementById('digit-4').value,
    ].join('');
    console.log("KOD", verificationCode);
    try {
      const response = await fetch(`https://${host}/api/auth/twofactor/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, code: verificationCode }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hata: ${errorText}`);
      }

      const data = await response.json();
      console.log("Gelen Yanıt:", data);

      if (!data.data || !data.data.message || !data.data.message.access_token || !data.data.message.refresh_token) {
        throw new Error("Sunucudan beklenen veri alınamadı!");
      }

      // ✅ Token ve Kullanıcı Bilgilerini Çekiyoruz
      localStorage.setItem('accessToken', data.data.message.access_token.token);
      localStorage.setItem('refreshToken', data.data.message.refresh_token.token);
      const accessToken = data.data.message.access_token.token;
      const refreshToken = data.data.message.refresh_token.token;
      console.log("Access Token:", accessToken);
      alert("Başarılı bir şekilde giriş yaptınız!");
      console.log(response.statusText, response.status); // this message came from backend
      if (!response.ok) {
        throw new Error(await response.text()); // Get specific error message from response
      }


      /*{
        "message": {
          "username": "bsoykan",
          "access_token": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJzb3lrYW4iLCJleHAiOjE3Njk1MjI1NTJ9.IPLvkNCCDQESoV5zGkv6-dsIWkUy3arxh5X2fboc9M8",
            "expiration_date": "2026-01-27T14:02:32.673Z"
          },
          "refresh_token": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJzb3lrYW4iLCJleHAiOjE3Njk1MjI1NTJ9.uLn9A4S3443EllNCaXMFRa6z81umNi2ZTLeT466dpTI",
            "expiration_date": "2026-01-27T14:02:32.673Z"
          }
        }
      } */

      // Handle successful response (e.g., redirect to the protected resource)
      console.log('Verification successful:', data);
      window.location.href = "/profile";
    } catch (error) {
      handleError(error); // Call a separate function to handle errors
    }
  });

  function handleError(error) {
    console.error('Error:', error);
    let errorMessage = 'An error occurred.';

    if (error.message === 'Invalid code. Please try again.') {
      errorMessage = error.message;
    } else if (error.message.includes('Network error')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else {

    }

    alert(errorMessage);
  }
}
document.addEventListener('DOMContentLoaded', init2fac);

// ... (rest of your code for input handling)

