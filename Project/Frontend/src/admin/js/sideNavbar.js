import { viewUserInfo, updateUser, deleteUser, fetchUsers } from "./users.js";
import { fetchTwoFactor, fetchMailTokens } from "./authFetch.js";
import { fetchFriend } from "./friends.js"
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
  });
  
}