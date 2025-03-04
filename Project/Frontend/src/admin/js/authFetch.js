import { formatDate } from "/admin/js/tools.js"
import { showToast } from "/js/profileUI.js";


export async function fetchTwoFactor() {
	try {
		const accessToken = localStorage.getItem("accessToken");
		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

		const response = await fetch(`${apiBaseUrl}auth/listtwofactor/`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Accept-Language': localStorage.getItem('language'),
				'Authorization': `Bearer ${accessToken}`
			}
		}); // API URL
		if (!response.ok) {
			throw new Error(`API Error: ${response.error}`);
		}
		const mails = await response.json(); // API'den dönen yanıt
		// `mails.message` altındaki diziye erişim
		const factorArray = mails.data;
		// Eğer `factorArray` bir dizi değilse hata at
		if (!Array.isArray(factorArray)) {
			throw new Error("The API response does not contain a valid array of users.");
		}
		const tableBody = document.getElementById('FactorTableBody');
		if (!tableBody) {
			console.error("Table body element not found!");
			return;
		}
		// Kullanıcıları tabloya ekle
		tableBody.innerHTML = ''; // Tabloyu boşalt
		factorArray.forEach(factor => {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${factor.username}</td>
				<td>${factor.email}</td>
				<td>${formatDate(factor.expiration)}</td>
				<td>${factor.status}</td>
			`;
			tableBody.appendChild(row);
		});
	} catch (error) {
		console.error('Error fetching users:', error);
	}
}


export async function fetchMailTokens() {
	try {
		const accessToken = localStorage.getItem("accessToken");
		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

		const response = await fetch(`${apiBaseUrl}auth/listmail/`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Accept-Language': localStorage.getItem('language'),
				'Authorization': `Bearer ${accessToken}`
			}
		}); // API URL
		if (!response.ok) {
			throw new Error(`API Error: ${response.error}`);
		}
		const mails = await response.json(); // API'den dönen yanıt
		// `mails.message` altındaki diziye erişim
		const mailArray = mails.data;
		// Eğer `mailArray` bir dizi değilse hata at
		if (!Array.isArray(mailArray)) {
			throw new Error("The API response does not contain a valid array of users.");
		}
		const tableBody = document.getElementById('MailTableBody');
		if (!tableBody) {
			console.error("Table body element not found!");
			return;
		}
		// Kullanıcıları tabloya ekle
		tableBody.innerHTML = ''; // Tabloyu boşalt
		mailArray.forEach(mail => {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${mail.username}</td>
				<td>${mail.email}</td>
				<td>${mail.type}</td>
				<td>${formatDate(mail.expiration)}</td>
				<td>${mail.status}</td>
				<td>
					<button class="btn btn-info btn-sm  view-mail" data-username="${mail.username}" data-token="${mail.token}"> <i class="bi bi-info-circle"></i> </button>
					<button class="btn btn-danger btn-sm delete-mail"data-username="${mail.username}" data-token="${mail.token}"> <i class="bi bi-trash"></i> </button>
				</td>
			`;
			tableBody.appendChild(row);
		});
	} catch (error) {
		console.error('Error fetching users:', error);
	}
}

export async function infoMail(username, token) {
	
	let user = null;
	try {
		const accessToken = localStorage.getItem("accessToken");
		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

		const response = await fetch(`${apiBaseUrl}auth/mailinfo/${username}/${token}/`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Accept-Language': 'tr',
				'Authorization': `Bearer ${accessToken}`
			}
		}); // API URL
		if (!response.ok) {
			throw new Error(`API Error: ${response.error}`);
		}
		const friend = await response.json(); // API'den dönen yanıt
		// `users.message` altındaki diziye erişim
		user = friend.data;

	} catch (error) {
		console.error('Error fetching users:', error);
	}

	// Kullanıcı bilgilerini modal içine yerleştir
	document.getElementById("userUsername").innerText = user.username;
	document.getElementById("userEmail").innerText = user.email;
	document.getElementById("mailToken").innerText = user.token;
	document.getElementById("tokenType").innerText = user.type;
	document.getElementById("tokenStatus").innerText = user.status;
	document.getElementById("expiration").innerText = formatDate(user.expiration);
	document.getElementById("created").innerText = formatDate(user.created_at);
	document.getElementById("updated").innerText = formatDate(user.updated_at);


	// Bootstrap modalını aç
	const userInfoModal = new bootstrap.Modal(document.getElementById('MailTokenInfoModal'));
	userInfoModal.show();
}


export async function deleteMail(username, token) {
	// Kullanıcıya onay sorusu göster
	const isConfirmed = confirm("Silmek istediğinizden emin misiniz?");
	
	if (isConfirmed) {
		try {
			const accessToken = localStorage.getItem("accessToken");
			const host = window.location.host;
			const apiBaseUrl = `https://${host}/api/`;

			const response = await fetch(`${apiBaseUrl}auth/mailDelete/${username}/${token}/`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': `Bearer ${accessToken}`
				}
			});

			if (!response.ok) {
				throw new Error(`API Error: ${response.error}`);
			}

			// Silme işlemi başarılı
			showToast("başarıyla silindi!");
			// Tabloyu güncelle
			fetchMailTokens()
		} catch (error) {
			console.error('Error deleting user:', error);
			showToast("Bir hata oluştu. Mail silinemedi.", "danger");
		}
	}
}
