document.getElementById('login-form').addEventListener('submit', handleFormSubmit);


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
	  alert(response.status);
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
