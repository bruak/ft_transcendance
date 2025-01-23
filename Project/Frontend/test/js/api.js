document.getElementById('login-form').addEventListener('submit', handleFormSubmit);
document.getElementById('2').addEventListener('click', auth_42);

async function auth_42() {
	event.preventDefault();
	const response = await fetch('http://localhost:8003/intra/', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	console.log(response);
	if (!response.ok) {
		throw new Error('Authentication failed');
	}

	const data = await response.json();
	alert(data.message);
	console.log('Authentication successful:', data);

	// Handle successful response (e.g., redirect to the protected resource)
	if(response.ok) {
		window.location.href = "http://localhost:8003/intra/";  // Giriş yaptıktan sonra yönlendirilen sayfa.
	}
}

async function handleFormSubmit(event) {
	event.preventDefault();

	const sign = document.getElementById("login-username").value;
	const password = document.getElementById("login-password").value;

	try {
	  const response = await fetch("http://localhost:8003/singin/", {
		method: 'POST',
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({ sign, password }),
	  });

	  if (!response.ok) {
		throw new Error('Giriş başarısız! Lütfen bilgilerinizi kontrol edin.');
	  }

	  // Yanıtı JSON formatında al
	  const data = await response.json();
	  
	  alert(response.message, response.status);
	  // Başarılı giriş sonrası yapılacak işlemler (örneğin, kullanıcıyı yönlendirme veya token saklama)
	  console.log("Giriş başarılı:", data);

	  // Burada örnek olarak token'ı yerel depolamaya kaydediyoruz
	  //localStorage.setItem("authToken", data.token);  // Bu, örnek bir işlemdir; yanıt formatına göre özelleştirilebilir.
      localStorage.setItem("username", sign);
	  // Kullanıcıyı yönlendirme veya başka bir işlem
	if(response.ok) {
		window.location.href = "2factor.html";  // Giriş yaptıktan sonra yönlendirilen sayfa.
	}

	} catch (error) {
	  console.error("Hata:", error);
	  // Kullanıcıya hata mesajını gösterebilirsiniz
	  alert(error.message);
	}
  }

