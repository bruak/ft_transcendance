export function initProfile() {
    try {
        const host = window.location.host;

        // Profil Düzenleme Formu İşleme
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', function (event) {
                event.preventDefault();

                const name = document.getElementById('profileName').value;
                const title = document.getElementById('profileTitle').value;
                const location = document.getElementById('profileLocation').value;
                const image = document.getElementById('profileImage').files[0];

                document.getElementById('profileNameDisplay').textContent = name;
                document.getElementById('profileTitleDisplay').textContent = title;
                document.getElementById('profileLocationDisplay').textContent = location;

                if (image) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const profileImageDisplay = document.getElementById('profileImageDisplay');
                        if (profileImageDisplay) {
                            profileImageDisplay.src = e.target.result;
                            localStorage.setItem('profileImage', e.target.result);
                        }
                    }
                    reader.readAsDataURL(image);
                }

                const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
                if (modal) {
                    modal.hide();
                }
            });
        }

        // Kaydedilmiş Profil Resmini Yükleme
        const savedProfileImage = localStorage.getItem('profileImage');
        if (savedProfileImage) {
            const profileImageDisplay = document.getElementById('profileImageDisplay');
            const profileSmallPhoto = document.getElementById('profileSmallPhoto');
            if (profileImageDisplay) {
                profileImageDisplay.src = savedProfileImage;
            }
            if (profileSmallPhoto) {
                profileSmallPhoto.src = savedProfileImage;
            }
        }

        // Kullanıcı Bilgilerini API'den Çekme
        console.log(localStorage.getItem("accessToken"));
        fetch(`https://${host}/users/api/getuser/${localStorage.getItem("username")}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem("accessToken")}`, 'Accept-Language': 'tr' }
        })
        .then(response => response.json())
        .then(user => {
            const profileNameDisplay = document.getElementById('profileNameDisplay');
            const profileUsernameDisplay = document.getElementById('profileUsernameDisplay');
            const profileTitleDisplay = document.getElementById('profileTitleDisplay');
            const profileLocationDisplay = document.getElementById('profileLocationDisplay');
            const profileImageDisplay = document.getElementById('profileImageDisplay');
            const profileSmallPhoto = document.getElementById('profileSmallPhoto');

            if (profileNameDisplay) {
                profileNameDisplay.textContent = user.first_name + ' ' + user.last_name;
            }
            if (profileUsernameDisplay) {
                profileUsernameDisplay.textContent = user.username ? user.username : 'Ayarlanmamış';
            }
            if (profileTitleDisplay) {
                profileTitleDisplay.textContent = user.title ? user.title : 'Ayarlanmamış';
            }
            if (profileLocationDisplay) {
                profileLocationDisplay.textContent = user.location ? user.location : 'Ayarlanmamış';
            }
            if (profileImageDisplay) {
                profileImageDisplay.src = user.avatar ? user.avatar : 'img/tufan.jpg';
            }
            if (profileSmallPhoto) {
                profileSmallPhoto.src = user.avatar ? user.avatar : 'img/ibrahim.jpg';
            }
        })
        .catch(error => console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', error));

        // Arkadaş Arama İşlemi
        const friendSearchButton = document.getElementById('friendSearchButton');
        if (friendSearchButton) {
            friendSearchButton.addEventListener('click', function () {
                const searchInput = document.getElementById('friendSearchInput').value;
                if (searchInput) {
                    fetch(`/api/search-friends?query=${searchInput}`)
                        .then(response => response.json())
                        .then(data => {
                            const suggestionsList = document.getElementById('friendSuggestions');
                            if (suggestionsList) {
                                suggestionsList.innerHTML = '';
                                data.forEach(user => {
                                    const listItem = document.createElement('li');
                                    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                                    listItem.textContent = user.name;
                                    const addButton = document.createElement('button');
                                    addButton.className = 'btn btn-primary';
                                    addButton.textContent = 'Arkadaş Ekle';
                                    addButton.onclick = () => {
                                        fetch(`/api/add-friend`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ friendId: user.id }),
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                if (data.success) {
                                                    alert('Arkadaş eklendi!');
                                                } else {
                                                    alert('Arkadaş eklenemedi.');
                                                }
                                            })
                                            .catch(error => console.error('Arkadaş eklenirken hata oluştu:', error));
                                    };
                                    listItem.appendChild(addButton);
                                    suggestionsList.appendChild(listItem);
                                });
                            }
                        })
                        .catch(error => console.error('Arkadaşlar aranırken hata oluştu:', error));
                }
            });
        }

        // Arkadaşları Görüntüleme İşlemi
        const viewFriendsButton = document.getElementById('viewFriendsButton');
        if (viewFriendsButton) {
            viewFriendsButton.addEventListener('click', function () {
                fetch('/api/friends')
                    .then(response => response.json())
                    .then(friends => {
                        const friendsList = document.getElementById('friendsList');
                        if (friendsList) {
                            friendsList.innerHTML = friends.length > 0
                                ? friends.map(friend => `<li class="list-group-item">${friend.name}</li>`).join('')
                                : '<li class="list-group-item">Henüz arkadaşınız yok.</li>';
                        }
                    })
                    .catch(error => console.error('Arkadaşlar yüklenirken hata oluştu:', error));
            });
        }

        // Çıkış Yapma İşlemi
        const signOutLink = document.querySelector('.dropdown-menu a[href="#signout"]');
        if (signOutLink) {
            signOutLink.addEventListener('click', function () {
                fetch('https://localhost:8080/api/auth/singout/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Accept-Language': 'tr',
                        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                    }
                })
                .then(response => {
                    if (response.ok) {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("username");
                        window.location.href = '/';
                    } else {
                        console.error('Çıkış yaparken hata oluştu:', response.statusText);
                    }
                })
                .catch(error => console.error('Çıkış yaparken hata oluştu:', error));
            });
        }

    } catch (error) {
        console.error('initializeProfile fonksiyonunda hata oluştu:', error);
    }
}

// Sayfa Yüklendiğinde initProfile Fonksiyonunu Çağır
document.addEventListener('DOMContentLoaded', initProfile);
