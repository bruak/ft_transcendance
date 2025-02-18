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
					<button class="btn btn-info btn-sm" onclick="viewUserInfo('${friend.username}')"> <i class="bi bi-info-circle"></i> </button>
					<button class="btn btn-warning btn-sm" onclick="updateUser('${friend.username}')"> <i class="bi bi-pencil"></i> </button>
					<button class="btn btn-danger btn-sm" onclick="deleteUser('${friend.username}')"> <i class="bi bi-trash"></i> </button>
				</td>
			`;
			tableBody.appendChild(row);
		});
	} catch (error) {
		console.error('Error fetching users:', error);
	}
}
