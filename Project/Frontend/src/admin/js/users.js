import { formatDate } from "./tools.js";

export async function viewUserInfo(username) {
	// Örnek veri kaynağı (gerçek API verisini burada çekebilirsiniz)
	let user = null;
	try {
		const accessToken = localStorage.getItem("accessToken");
		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

		const response = await fetch(`${apiBaseUrl}user/adminuser/${username}/`,
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
			throw new Error(`API Error: ${response.status}`);
		}
		const users = await response.json(); // API'den dönen yanıt
		// `users.message` altındaki diziye erişim
		user = users.data;

	} catch (error) {
		console.error('Error fetching users:', error);
	}
	const authUsers = await fetchUserDetails(user.username)
	const is_active = authUsers.is_active
	// Kullanıcı bilgilerini modal içine yerleştir
	document.getElementById("userAvatar").src = user.avatar;
	document.getElementById("userFullName").innerText = `${user.first_name} ${user.last_name}`;
	document.getElementById("userUsername").innerText = user.username;
	document.getElementById("userEmail").innerText = user.email;
	document.getElementById("mailStatus").innerText = is_active;
	document.getElementById("userCreated").innerText = formatDate(user.created_at);
	document.getElementById("userUpdated").innerText = formatDate(user.updated_at);

	// Bootstrap modalını aç
	const userInfoModal = new bootstrap.Modal(document.getElementById('userInfoModal'));
	userInfoModal.show();
}

export async function updateUser(username) {
	try {
	  const accessToken = localStorage.getItem("accessToken");
	  const host = window.location.host;
	  const apiBaseUrl = `https://${host}/api/`;

	  // API'den mevcut kullanıcıyı al
	  const response = await fetch(`${apiBaseUrl}user/adminuser/${username}/`, {
		method: 'GET',
		headers: {
		  'Content-Type': 'application/json',
		  'Accept': 'application/json',
		  'Accept-Language': 'tr',
		  'Authorization': `Bearer ${accessToken}`
		}
	  });
  
	  if (!response.ok) {
		throw new Error(`API Error: ${response.status}`);
	  }
  
	  const user = await response.json();
	  const data = user.data; // Gelen kullanıcı verisi
  
	  // Modalda gösterilecek mevcut kullanıcı bilgilerini yerleştir
	  document.getElementById("updateFirstName").value = data.first_name;
	  document.getElementById("updateLastName").value = data.last_name;
	  // Avatarın URL'sini göster veya varsayılan olarak bir şey ekleyebilirsiniz
	  document.getElementById("updateAvatar").value = '';
  
	  // Modal'ı göster
	  const updateUserModal = new bootstrap.Modal(document.getElementById('updateUserModal'));
	  updateUserModal.show();
  
	  // Formu güncellemeye gönder
	  const updateUserForm = document.getElementById('updateUserForm');
	  updateUserForm.onsubmit = async function(event) {
		event.preventDefault();
  
		// Form verilerini al
		const updatedFirstName = document.getElementById("updateFirstName").value;
		const updatedLastName = document.getElementById("updateLastName").value;
		const updatedAvatar = document.getElementById("updateAvatar").files[0];
  
		const formData = new FormData();
		formData.append("first_name", updatedFirstName);
		formData.append("last_name", updatedLastName);
		if (updatedAvatar) {
		  formData.append("avatar", updatedAvatar);
		}
  
		// PUT isteği gönder
		const updateResponse = await fetch(`${apiBaseUrl}auth/adminput/${username}/`, {
		  method: 'POST',
		  headers: {
			'Authorization': `Bearer ${accessToken}`,
		  },
		  body: formData
		});
  
		if (!updateResponse.ok) {
		  throw new Error(`API Error: ${updateResponse.status}`);
		}
  
		const result = await updateResponse.json();
		alert("Kullanıcı başarıyla güncellendi!");
		fetchUsers();	
		// Modal'ı kapat*/
		updateUserModal.hide();
	  };
	} catch (error) {
	  console.error('Error updating user:', error);
	}
}

export async function deleteUser(username) {
    // Kullanıcıya onay sorusu göster
    const isConfirmed = confirm("Silmek istediğinizden emin misiniz?");
    
    if (isConfirmed) {
        try {
            const accessToken = localStorage.getItem("accessToken");
            const host = window.location.host;
            const apiBaseUrl = `https://${host}/api/`;

            const response = await fetch(`${apiBaseUrl}auth/delete/${username}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            // Silme işlemi başarılı
            alert("Kullanıcı başarıyla silindi!");
            // Tabloyu güncelle
            fetchUsers()
        } catch (error) {
            console.error('Error deleting user:', error);
            alert("Bir hata oluştu. Kullanıcı silinemedi.");
        }
    }
}


export async function fetchUsers() {
	try {
		const accessToken = localStorage.getItem("accessToken");

		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

		const response = await fetch(`${apiBaseUrl}user/get/`,
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
			throw new Error(`API Error: ${response.status}`);
		}
		const users = await response.json(); 
		const userArray = users.data;

		// Eğer `userArray` bir dizi değilse hata at
		if (!Array.isArray(userArray)) {
			throw new Error("The API response does not contain a valid array of users.");
		}

		const tableBody = document.getElementById('usersTableBody');
		if (!tableBody) {
			console.error("Table body element not found!");
			return;
		}
		// Kullanıcıları tabloya ekle
		tableBody.innerHTML = ''; // Tabloyu boşalt
		for (const user of userArray) {
			try {
				const authusers = await fetchUserDetails(user.username);
				
				const row = document.createElement('tr');
				row.innerHTML = `
					<td><img src="${user.avatar}" alt="Avatar" style="width: 50px; height: 50px; border-radius: 50%;"></td>
					<td>${user.first_name} ${user.last_name}</td>
					<td>${user.username}</td>
					<td>${user.email}</td>
					<td>${authusers.is_active} </td>
					<td>
						<button class="btn btn-info btn-sm view-user" data-username="${user.username}")"> <i class="bi bi-info-circle"></i> </button>
						<button class="btn btn-warning btn-sm update-user" data-username="${user.username}")"> <i class="bi bi-pencil"></i> </button>
						<button class="btn btn-danger btn-sm delete-user" data-username="${user.username}")"> <i class="bi bi-trash"></i> </button>
					</td>
				`;
				tableBody.appendChild(row);
			} catch (error) {
				console.error(`Error fetching details for user ${user.username}:`, error.message);
			}
		}
	} catch (error) {
		console.error('Error fetching users:', error);
	}
}

async function fetchUserDetails(username) {

	const accessToken = localStorage.getItem("accessToken");
	const host = window.location.host;
	const apiBaseUrl = `https://${host}/api/`;

    try {
        // Fetch isteği
        const listResponse = await fetch(`${apiBaseUrl}auth/listusers/${username}/`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Language': 'tr',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // Hatalı durumlarda Exception fırlatma
        if (!listResponse.ok) {
            throw new Error(`API Error: ${listResponse.status}`);
        }

        // JSON yanıtını ayrıştırma
        const jsonResponse = await listResponse.json();

        // `data` alanını kontrol etme
        const authusers = jsonResponse.data;
        if (!authusers || typeof authusers !== "object") {
            throw new Error("The API response does not contain a valid object in data.");
        }
        // Veriyi döndürme
        return authusers;
    } catch (error) {
        console.error("Error fetching user details:", error.message);
        throw error; // Hatanın üst katmana iletilmesi
    }
}
