import { loadNavbar } from "/admin/js/tools.js"
import {router} from "/js/app.js"

export async function initializeTopNavbar() {
	await loadNavbar("top-navbar", "/admin/top-navbar.html");
	notice();
	getuser();

	// Arama ile ilgili olaylar
	initializeSearchForm();
	initializeSearchInput();

	// Dil seçimi
	initializeLanguageDropdown();
}

function initializeSearchForm() {
	const searchForm = document.getElementById('searchForm');
	if (searchForm) {
		searchForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			const query = document.getElementById('searchInput').value.trim();
			if (query) {
				await searchUsers(query);
			}
		});
	
	document.getElementById('logout').addEventListener('click', function(event) {
			event.preventDefault(); // Varsayılan işlem (yönlendirme) engellenir
			console.log('Logout clicked!');
			
			singout();
		});

	document.getElementById('myaccount').addEventListener('click', function(event) {
		event.preventDefault();
	  	const username = localStorage.getItem('username')
		history.pushState(null, null, `/profile/${username}`)
		router()
	});
		  
	}
}

async function searchUsers(query) {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const host = window.location.host;
        const apiBaseUrl = `https://${host}/api/`;

        const response = await fetch(`${apiBaseUrl}user/search/${query}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Language': 'tr',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.error}`);
        }

        const users = await response.json(); // API'den dönen yanıt

        const userArray = users.data;
        // Eğer `userArray` bir dizi değilse hata at
        if (!Array.isArray(userArray)) {
            throw new Error("The API response does not contain a valid array of users.");
        }

        const userList = document.getElementById('userList'); // Bildirimler gibi kullanıcıları listeleyeceğimiz bir `ul` elementi

        if (!userList) {
            console.error("User list element not found!");
            return;
        }

        // Önceki liste öğelerini temizle
        userList.innerHTML = "";

		if (userArray.length === 0) {
			const li = document.createElement('li');
			li.innerHTML = `<span class="dropdown-item">No results found for "${query}".</span>`;
			userList.appendChild(li);
		}
        // Kullanıcıları bildirim şeklinde listele
        userArray.forEach(user => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a class="dropdown-item" href="#">
                    <img src="${user.avatar}" alt="Avatar" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;">
                    <strong>${user.first_name} ${user.last_name}</strong> - ${user.username}
                </a>
            `;
            userList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
    userList.style.display = "block";

}


function initializeSearchInput() {
	const searchInput = document.getElementById('searchInput');
	if (searchInput) {
		searchInput.addEventListener('input', (event) => {
			const query = event.target.value.trim();
			const userList = document.getElementById('userList');
			const clearSearch = document.getElementById('clearSearch');

			if (query) {
				searchUsers(query);
			} else {
				if (userList) userList.style.display = "none";
				if (clearSearch) clearSearch.style.display = "none";
			}
		});

		searchInput.addEventListener('blur', () => {
			const userList = document.getElementById('userList');
			if (userList) userList.style.display = "none";
		});
	}
}

function initializeLanguageDropdown() {
	const dropdown = document.getElementById('languageDropdown');
	if (dropdown) {
		const language = localStorage.getItem('language');
		if (language === "en") {
			dropdown.innerHTML = `<img src="/admin/img/en.png" alt="EN" class="me-2" style="width: 20px;"> EN`;
		}

		const dropdownMenu = dropdown.nextElementSibling;
		if (dropdownMenu) {
			dropdownMenu.addEventListener('click', (event) => {
				const target = event.target.closest('.dropdown-item');
				if (target) {
					const languageCode = target.getAttribute('data-lang');
					const flag = target.querySelector('img').src;
					dropdown.innerHTML = `<img src="${flag}" alt="${languageCode.toUpperCase()}" class="me-2" style="width: 20px;"> ${languageCode.toUpperCase()}`;
					localStorage.setItem('language', languageCode);
				}
			});
		}
	}
}


async function getuser() {
	try {
		const accessToken = localStorage.getItem("accessToken");
		const username = localStorage.getItem("username");
		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

		const response = await fetch(`${apiBaseUrl}user/getuser/${username}/`,
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
		const users = await response.json(); // API'den dönen yanıt
		// `users.message` altındaki diziye erişim
		const user = users.data;

		// Eğer `notificationArray` bir dizi değilse hata at

		const adminUser = document.getElementById('adminuser');
		const img = adminUser.querySelector("button img"); // İlk img öğesini seç
		const span = adminUser.querySelector("button span"); // İlk span öğesini seç
		img.src = user.avatar
		span.innerText = username

	} catch (error) {
		console.error('Error fetching users:', error);
	}
}


async function notice() {
	try {
		const accessToken = localStorage.getItem("accessToken");
		const username = localStorage.getItem("username");
		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

		const response = await fetch(`${apiBaseUrl}friend/list_friend_requests/${username}/`,
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
		const users = await response.json(); // API'den dönen yanıt
		// `users.message` altındaki diziye erişim
		const notificationArray = users?.data || [];

		// Eğer `notificationArray` bir dizi değilse hata at

		const notification = document.getElementById('notification');
		const notification_count = document.getElementById('notification-count');
		if (notificationArray.length == 0) {
			notification_count.innerText = 0;
			const li = document.createElement('li');
			li.innerHTML = "<a class='dropdown-item text-center'>Mesaj Yok</a>";
			notification.appendChild(li);
		}
		else
		{
			notificationArray.forEach(user => {
				notification_count.innerText = notificationArray.length;
				const li = document.createElement('li');
				li.innerHTML = `
					<a class="dropdown-item" href="#">
						<strong>${user.username}</strong> adlı kullanıcı size arkadaşlık isteği gönderdi.
					</a>
				`;
				notification.appendChild(li);
			});
		}

	} catch (error) {
		console.error('Error fetching users:', error);
	}
}


async function singout() {
	try {
		const accessToken = localStorage.getItem("accessToken");
		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

		const response = await fetch(`${apiBaseUrl}auth/singout/`,
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
		history.pushState(null,null,`/`);
		router();
	} catch (error) {
		console.error('Error fetching users:', error);
	}
}

