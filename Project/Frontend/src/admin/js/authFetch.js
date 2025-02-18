import { formatDate } from "./tools.js"


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
			throw new Error(`API Error: ${response.status}`);
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
				<td>
					<button class="btn btn-info btn-sm  view-user" data-username="${factor.username}")"> <i class="bi bi-info-circle"></i> </button>
					<button class="btn btn-warning btn-sm update-user"  data-username="${factor.username}")"> <i class="bi bi-pencil"></i> </button>
					<button class="btn btn-danger btn-sm delete-user" data-username="${factor.username}")"> <i class="bi bi-trash"></i> </button>
				</td>
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
			throw new Error(`API Error: ${response.status}`);
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
					<button class="btn btn-info btn-sm  view-user" data-username="${mail.username}")"> <i class="bi bi-info-circle"></i> </button>
					<button class="btn btn-warning btn-sm update-user"  data-username="${mail.username}")"> <i class="bi bi-pencil"></i> </button>
					<button class="btn btn-danger btn-sm delete-user" data-username="${mail.username}")"> <i class="bi bi-trash"></i> </button>
				</td>
			`;
			tableBody.appendChild(row);
		});
	} catch (error) {
		console.error('Error fetching users:', error);
	}
}