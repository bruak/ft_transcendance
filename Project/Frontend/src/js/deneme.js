/* ======================[*] Profil Sayfasını Başlatma Fonksiyonu [*]====================== */
export function initProfile() {
    try {
		const host = window.location.host;
        const apiBaseUrl = `https://${host}/api`;
        const path = window.location.pathname;
        const isOwnProfile = path === '/profile';
        const username = isOwnProfile ? localStorage.getItem("username") : path.split('/').pop();
        const accessToken = localStorage.getItem("accessToken");

        console.log('Profil sayfası:', path);

        /* ======================[*] Navbar İçeriğini Yükleme [*]====================== */
        fetch('/views/navbar.html')
            .then(response => response.text())
            .then(data => document.getElementById('navbar-container').innerHTML = data)
            .catch(error => console.error('Navbar yüklenirken hata oluştu:', error));

        /* ======================[*] Kullanıcı Bilgilerini API'den Çekme [*]====================== */
        fetch(`${apiBaseUrl}/user/getuser/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Language': 'tr',
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(user => updateProfileUI(user))
        .catch(error => {
            console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', error);
            showErrorMessage("Kullanıcı bilgileri yüklenirken bir hata oluştu.");
        });

        /* ======================[*] Profil Düzenleme Formu İşleme [*]====================== */
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm && isOwnProfile) {
            editProfileForm.addEventListener('submit', function (event) {
                event.preventDefault();

                const formData = new FormData();
                formData.append('first_name', document.getElementById('profileName').value);
                formData.append('title', document.getElementById('profileTitle').value);
                formData.append('location', document.getElementById('profileLocation').value);
                
                const image = document.getElementById('profileImage').files[0];
                if (image) {
                    formData.append('avatar', image);
                }

                fetch(`${apiBaseUrl}/auth/singup/`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Language': 'tr',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Profil başarıyla güncellendi!');
                        updateProfileUI(data);
                    } else {
                        alert('Profil güncellenemedi.');
                    }
                })
                .catch(error => {
                    console.error('Profil güncellenirken hata oluştu:', error);
                    showErrorMessage("Profil güncellenirken bir hata oluştu.");
                });
            });
        }

        /* ======================[*] Arkadaş Arama İşlemi [*]====================== */
        const friendSearchInput = document.getElementById('friendSearchInput');
        if (friendSearchInput) {
            friendSearchInput.addEventListener('input', function () {
                const searchInput = friendSearchInput.value;
                const suggestionsList = document.getElementById('friendSuggestions');

                if (searchInput) {
                    fetch(`${apiBaseUrl}/user/get/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Accept-Language': 'tr',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                    .then(response => response.json())
                    .then(users => {
                        suggestionsList.innerHTML = '';
                        const filteredUsers = users.filter(user => user.username.includes(searchInput));

                        filteredUsers.forEach(user => {
                            const listItem = document.createElement('li');
                            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                            listItem.textContent = `${user.first_name} ${user.last_name}`;

                            const addButton = document.createElement('button');
                            addButton.className = 'btn btn-primary';
                            addButton.textContent = 'Arkadaş Ekle';
                            addButton.onclick = () => sendFriendRequest(username, user.username);
                            
                            listItem.appendChild(addButton);
                            suggestionsList.appendChild(listItem);
                        });

                        suggestionsList.style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Arkadaşlar aranırken hata oluştu:', error);
                        showErrorMessage("Arkadaşlar aranırken bir hata oluştu.");
                    });
                } else {
                    suggestionsList.innerHTML = '';
                    suggestionsList.style.display = 'none';
                }
            });
        }

        /* ======================[*] Arkadaşları Görüntüleme [*]====================== */
        const viewFriendsButton = document.getElementById('viewFriendsButton');
        if (viewFriendsButton) {
            viewFriendsButton.addEventListener('click', function () {
                fetch(`${apiBaseUrl}/friend/friends/${username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Accept-Language': 'tr',
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                .then(response => response.json())
                .then(friends => displayFriendsList(friends))
                .catch(error => {
                    console.error('Arkadaşlar yüklenirken hata oluştu:', error);
                    showErrorMessage("Arkadaşlar yüklenirken bir hata oluştu.");
                });
            });
        }

        /* ======================[*] Çıkış Yapma [*]====================== */
        const signOutLink = document.querySelector('.dropdown-menu a[href="#signout"]');
        if (signOutLink) {
            signOutLink.addEventListener('click', function () {
                fetch(`${apiBaseUrl}/auth/singout/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Accept-Language': 'tr',
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                .then(response => {
                    if (response.ok) {
                        localStorage.clear();
                        window.location.href = '/';
                    } else {
                        throw new Error('Çıkış yaparken hata oluştu.');
                    }
                })
                .catch(error => {
                    console.error('Çıkış yaparken hata oluştu:', error);
                    showErrorMessage("Çıkış yaparken bir hata oluştu.");
                });
            });
        }

    } catch (error) {
        console.error('initializeProfile fonksiyonunda hata oluştu:', error);
        showErrorMessage("Profil yüklenirken bir hata oluştu.");
    }
}

/* ======================[*] Arkadaşlık İsteği Gönderme Fonksiyonu [*]====================== */
function sendFriendRequest(username, friendUsername) {
    fetch('https://localhost:8080/api/friend/send_friend_request/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'tr',
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({
            username: username,
            friend: friendUsername
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Arkadaşlık isteği gönderildi!');
        } else {
            alert('Arkadaşlık isteği gönderilemedi.');
        }
    })
    .catch(error => {
        console.error('Arkadaşlık isteği gönderilirken hata oluştu:', error);
        showErrorMessage("Arkadaşlık isteği gönderilirken bir hata oluştu.");
    });
}

/* ======================[*] Arkadaş Listesini Gösterme [*]====================== */
function displayFriendsList(friends) {
    const friendsList = document.getElementById('friendsList');
    if (friendsList) {
        friendsList.innerHTML = friends.length > 0
            ? friends.map(friend => `<li class="list-group-item">${friend.username}</li>`).join('')
            : '<li class="list-group-item">Henüz arkadaşınız yok.</li>';
    }
}

/* ======================[*] Profil Bilgilerini Güncelleme [*]====================== */
export function updateProfileUI(user) {
    const userData = user.data;
    document.getElementById('profileNameDisplay').textContent = `${userData.first_name} ${userData.last_name}`;
    document.getElementById('profileTitleDisplay').textContent = userData.title || 'Ayarlanmamış';
    document.getElementById('profileLocationDisplay').textContent = userData.location || 'Ayarlanmamış';
    document.getElementById('profileImageDisplay').src = userData.avatar || 'img/default-avatar.png';
    document.getElementById('profileSmallPhoto').src = userData.avatar || 'img/default-avatar.png';
}

/* ======================[*] Hata Mesajı Gösterme Fonksiyonu [*]====================== */
function showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message alert alert-danger";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

/* ======================[*] Sayfa Yüklendiğinde initProfile Fonksiyonunu Çağır [*]====================== */
document.addEventListener('DOMContentLoaded', initProfile);
