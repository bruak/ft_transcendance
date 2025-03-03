import { formatDate } from "./tools.js";

export async function viewFriendInfo(username, friendname) {
	// Örnek veri kaynağı (gerçek API verisini burada çekebilirsiniz)
	let user = null;
	try {
		const accessToken = localStorage.getItem("accessToken");
		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

		const response = await fetch(`${apiBaseUrl}friend/info/${username}/${friendname}/`,
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
		const friend = await response.json(); // API'den dönen yanıt
		// `users.message` altındaki diziye erişim
		user = friend.data;

	} catch (error) {
		console.error('Error fetching users:', error);
	}

	// Kullanıcı bilgilerini modal içine yerleştir
	document.getElementById("username").innerText = user.username;
	document.getElementById("friendname").innerText = user.friendname;
	document.getElementById("status").innerText = user.status;
	document.getElementById("created").innerText = formatDate(user.created);
	document.getElementById("update").innerText = formatDate(user.update);


	// Bootstrap modalını aç
	const userInfoModal = new bootstrap.Modal(document.getElementById('FriendInfoModal'));
	userInfoModal.show();
}

export async function updateFriend(username, frinedname) {
	try {
	  const accessToken = localStorage.getItem("accessToken");
	  const host = window.location.host;
	  const apiBaseUrl = `https://${host}/api/`;

	  // API'den mevcut kullanıcıyı al
	  const response = await fetch(`${apiBaseUrl}friend/info/${username}/${frinedname}/`, {
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
	  const data = user.data; 
  
	  // Modalda gösterilecek mevcut kullanıcı bilgilerini yerleştir
	  document.getElementById("updateUsername").value = data.first_name;
	  document.getElementById("updateFriendname").value = data.last_name;
	  document.getElementById('updateStatus').value = data.status;
  
	  // Modal'ı göster
	  const updateUserModal = new bootstrap.Modal(document.getElementById('FriendUpdateModal'));
	  updateUserModal.show();
  
	  // Formu güncellemeye gönder
	  const updateUserForm = document.getElementById('friendUpdateForm');
	  updateUserForm.onsubmit = async function(event) {
		event.preventDefault();
  
		// Form verilerini al
		const status = document.getElementById("updateStatus").value;

		const requestData = {
			status: status,
			username: username,
			friendname: frinedname,
		};
  
		// PUT isteği gönder
		const updateResponse = await fetch(`${apiBaseUrl}friend/update/`, {
		  method: 'POST',
		  headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
			'Accept-Language': 'tr',
		  },
		  body: JSON.stringify(requestData)
		});
  
		if (!updateResponse.ok) {
		  throw new Error(`API Error: ${updateResponse.status}`);
		}
  
		const result = await updateResponse.json();
		alert("Kullanıcı başarıyla güncellendi!");
		fetchFriend()
		// Modal'ı kapat*/
		updateUserModal.hide();
	  };
	} catch (error) {
	  console.error('Error updating user:', error);
	}
}

export async function deleteFriend(username, friendname) {
	// Kullanıcıya onay sorusu göster
	const isConfirmed = confirm("Silmek istediğinizden emin misiniz?");
	
	if (isConfirmed) {
		try {
			const accessToken = localStorage.getItem("accessToken");
			const host = window.location.host;
			const apiBaseUrl = `https://${host}/api/`;

			const response = await fetch(`${apiBaseUrl}friend/delete/${username}/${friendname}/`, {
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
			fetchFriend()
		} catch (error) {
			console.error('Error deleting user:', error);
			alert("Bir hata oluştu. Kullanıcı silinemedi.");
		}
	}
}



export async function fetchFriend() {
	try {
		const accessToken = localStorage.getItem("accessToken");
		const host = window.location.host;
		const apiBaseUrl = `https://${host}/api/`;

		const response = await fetch(`${apiBaseUrl}/friend/friend_list/`,
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
		const friends = await response.json(); // API'den dönen yanıt
		// `users.message` altındaki diziye erişim
		const friendArray = friends.data;
		// Eğer `friendArray` bir dizi değilse hata at
		if (!Array.isArray(friendArray)) {
			throw new Error("The API response does not contain a valid array of users.");
		}
		const tableBody = document.getElementById('friendsTableBody');
		if (!tableBody) {
			console.error("Table body element not found!");
			return;
		}
		tableBody.innerHTML = '';
		if (friendArray.length == 0) {
			const row = document.createElement('p')
			row.innerHTML = "Friend Boş"
			tableBody.appendChild(row);
			return
		}
		// Kullanıcıları tabloya ekle
		friendArray.forEach(friend => {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${friend.username} </td>
				<td>${friend.friendname}</td>
				<td>${friend.status}</td>
				<td>
					<button class="btn btn-info btn-sm friend-user" data-username="${friend.username}" data-friendname="${friend.friendname}"> <i class="bi bi-info-circle"></i> </button>
					<button class="btn btn-warning btn-sm friend-update"" data-username="${friend.username}" data-friendname="${friend.friendname}"> <i class="bi bi-pencil"></i> </button>
					<button class="btn btn-danger btn-sm friend-delete" data-username="${friend.username}" data-friendname="${friend.friendname}" > <i class="bi bi-trash"></i> </button>
				</td>
			`;
			tableBody.appendChild(row);
		});
	} catch (error) {
		console.error('Error fetching users:', error);
	}
}
