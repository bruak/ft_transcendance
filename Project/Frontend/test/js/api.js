document.getElementById('login-form').addEventListener('submit', handleFormSubmit);
document.getElementById('2').addEventListener('click', auth_42);

async function auth_42(event) {
	event.preventDefault();
	const response = await fetch('http://localhost:8003/intra/', {
		method: 'GET',
		headers: { // headers kaldırılıp denenecek
			'Content-Type': 'application/json',
		},
	});

	console.log(response);
	if (!response.ok) {
		throw new Error('Authentication failed');
	}

	const data = await response.json();
	alert(data.message); // its came from backend
	console.log('Authentication successful:', data);

	// Handle successful response (e.g., redirect to the protected resource)
	if(response.ok) {
		window.location.href = "http://localhost:8003/intra/";  // Giriş yaptıktan sonra yönlendirilen sayfa.
	} // burası default olarak vermek yerine yönlendirilecek path backend tarafından verilebilir.
}

async function handleFormSubmit(event) {
	event.preventDefault();

	const sign = document.getElementById("login-username").value;
	const password = document.getElementById("login-password").value;

	try {
	  const response = await fetch("http://localhost:8003/signin/", {
		method: 'POST',
		headers: {
		  "Content-Type": "application/json",},
		body: JSON.stringify({ sign, password }),
	  });

	  // if json request is problemanic
	  if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(errorData?.message || "Authentication failed in sing in js");
	  }
	  const data = await response.json();
	  
	  alert(data.message); // its came from backend
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

