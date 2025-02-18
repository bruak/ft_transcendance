import { viewUserInfo, updateUser, deleteUser, fetchUsers } from "./users.js";
import { fetchTwoFactor, fetchMailTokens } from "./authFetch.js";
import { fetchFriend, viewFriendInfo, updateFriend, deleteFriend } from "./friends.js"
import { loadNavbar } from "./tools.js"



export async function initializeSideNavbar() {
	await loadNavbar("side-navbar", "/admin/side-navbar.html");


	// Auth Mail Tokens
	const authUser = document.getElementById('authMail')
	if (authUser) {
		authUser.addEventListener('click', async (event) => {
			event.preventDefault();
			await loadNavbar('main-content', "/admin/mail.html")
			fetchMailTokens()
		})
	}
	// TwoFactor Sayfası
	const TwoFactor = document.getElementById('twofactor')
	if (TwoFactor) {
		TwoFactor.addEventListener('click', async (event) => {
			event.preventDefault();
			await loadNavbar('main-content', "/admin/twofactor.html")
			fetchTwoFactor()
		})
	}

	// Kullanıcılar sayfası
	const usersLink = document.getElementById('users');
	if (usersLink) {
		usersLink.addEventListener('click', async (event) => {
			event.preventDefault();
			await loadNavbar('main-content', "/admin/users.html");
			fetchUsers();
		});
	}

	// Dashboard sayfası
	const dashboard = document.getElementById('dashboard');
	if (dashboard) {
		dashboard.addEventListener('click', async (event) => {
			event.preventDefault();
			await loadNavbar('main-content', "/admin/dashboard.html");
		});
	}

	// Arkadaşlar sayfası
	const friend = document.getElementById('friend');
	if (friend) {
		friend.addEventListener('click', async (event) => {
			event.preventDefault();
			await loadNavbar('main-content', '/admin/friends.html');
			fetchFriend();
		});
	}


	// Kullanıcı Bilgi Butonlarını Dinleme
	document.addEventListener('click', (event) => {
		// Eğer tıklanan element 'view-user' sınıfına sahipse
		if (event.target.closest('.view-user')) {
		const username = event.target.closest('.view-user').dataset.username;
		viewUserInfo(username); // viewUserInfo fonksiyonunu çağır
		}
	
		// Eğer tıklanan element 'update-user' sınıfına sahipse
		if (event.target.closest('.update-user')) {
		const username = event.target.closest('.update-user').dataset.username;
		updateUser(username); // updateUser fonksiyonunu çağır
		}
	
		// Eğer tıklanan element 'delete-user' sınıfına sahipse
		if (event.target.closest('.delete-user')) {
		const username = event.target.closest('.delete-user').dataset.username;
		deleteUser(username); // deleteUser fonksiyonunu çağır
		}

		if (event.target.closest('.friend-user')) {
			const username = event.target.closest('.friend-user').dataset.username;
			const friendname = event.target.closest('.friend-user').dataset.friendname;

			viewFriendInfo(username, friendname); // viewUserInfo fonksiyonunu çağır
		}

		if (event.target.closest('.friend-update')) {
			const username = event.target.closest('.friend-update').dataset.username;
			const friendname = event.target.closest('.friend-update').dataset.friendname;
			updateFriend(username, friendname)
		}

		if (event.target.closest('.friend-delete')) {
			const username = event.target.closest('.friend-delete').dataset.username;
			const friendname = event.target.closest('.friend-delete').dataset.friendname;
			deleteFriend(username, friendname)
		}

  });
  
}