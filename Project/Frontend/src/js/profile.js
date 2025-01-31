export function initProfile() {

    
    try {
        const host = window.location.host;
        const path = window.location.pathname;
        const isOwnProfile = path === '/profile';
        console.log('Profil sayfası:', path); // Profil sayfasını kontrol et

        // Navbar içeriğini yükleme
        fetch('/views/navbar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('navbar-container').innerHTML = data;
                console.log('Navbar yüklendi'); // Navbar'ın yüklendiğini kontrol et
            })
            .catch(error => console.error('Navbar yüklenirken hata oluştu:', error));

        // Profil Düzenleme Formu İşleme
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm && isOwnProfile) {
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
        const username = isOwnProfile ? localStorage.getItem("username") : path.split('/').pop();
        console.log('Kullanıcı adı:', username); // Kullanıcı adını kontrol et
        fetch(`https://${host}/users/api/getuser/${username}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem("accessToken")}`, 'Accept-Language': 'tr' }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(user => {
            if (user.error) {
                throw new Error(user.error);
            }
            console.log('Kullanıcı bilgileri:', user); // Kullanıcı bilgilerini kontrol et
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

            if (!isOwnProfile) {
                const profileActions = document.getElementById('profileActions');
                if (profileActions) {
                    profileActions.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', error);
            showErrorMessage("Kullanıcı bilgileri yüklenirken bir hata oluştu.");
        });

        // Arkadaş Arama İşlemi
        const friendSearchInput = document.getElementById('friendSearchInput');
        if (friendSearchInput) {
            friendSearchInput.addEventListener('input', function () {
                const searchInput = friendSearchInput.value;
                const suggestionsList = document.getElementById('friendSuggestions');
                if (searchInput) {
                    fetch(`https://${host}/users/api/get/?query=${searchInput}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Accept-Language': 'tr',
                            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Arama sonuçları:', data); // Arama sonuçlarını kontrol et
                        if (suggestionsList) {
                            suggestionsList.innerHTML = '';
                            data.forEach(user => {
                                console.log('User:', user); // User nesnesini kontrol et
                                const listItem = document.createElement('li');
                                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                                listItem.textContent = user.first_name + ' ' + user.last_name; // Kullanıcı adını ve soyadını göster
                                const addButton = document.createElement('button');
                                addButton.className = 'btn btn-primary';
                                addButton.textContent = 'Arkadaş Ekle';
                                addButton.onclick = () => {
                                    console.log('Arkadaş ekleniyor:', user.id); // Arkadaş ekleme işlemini kontrol et
                                    fetch(`https://${host}/users/api/add-friend`, { // URL'yi kontrol edin
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                                        },
                                        body: JSON.stringify({ friendId: user.id }),
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        console.log('Arkadaş ekleme sonucu:', data); // Arkadaş ekleme sonucunu kontrol et
                                        if (data.success) {
                                            alert('Arkadaş eklendi!');
                                        } else {
                                            alert('Arkadaş eklenemedi.');
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Arkadaş eklenirken hata oluştu:', error);
                                        showErrorMessage("Arkadaş eklenirken bir hata oluştu.");
                                    });
                                };
                                listItem.appendChild(addButton);
                                suggestionsList.appendChild(listItem);
                            });
                            suggestionsList.style.display = 'block';
                        }
                    })
                    .catch(error => {
                        console.error('Arkadaşlar aranırken hata oluştu:', error);
                        showErrorMessage("Arkadaşlar aranırken bir hata oluştu.");
                    });
                } else {
                    if (suggestionsList) {
                        suggestionsList.innerHTML = '';
                        suggestionsList.style.display = 'none';
                    }
                }
            });
        }

        // Arkadaşları Görüntüleme İşlemi
        const viewFriendsButton = document.getElementById('viewFriendsButton');
        if (viewFriendsButton) {
            viewFriendsButton.addEventListener('click', function () {
                fetch('https://localhost:8080/users/api/get/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Language': 'tr',
                        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                    }
                })
                .then(response => response.json())
                .then(friends => {
                    console.log('Arkadaş listesi:', friends); // Arkadaş listesini kontrol et
                    const friendsList = document.getElementById('friendsList');
                    if (friendsList) {
                        friendsList.innerHTML = friends.length > 0
                            ? friends.map(friend => `<li class="list-group-item">${friend.name}</li>`).join('')
                            : '<li class="list-group-item">Henüz arkadaşınız yok.</li>';
                    }
                })
                .catch(error => {
                    console.error('Arkadaşlar yüklenirken hata oluştu:', error);
                    showErrorMessage("Arkadaşlar yüklenirken bir hata oluştu.");
                });
            });
        }

        // Çıkış Yapma İşlemi
        const signOutLink = document.querySelector('.dropdown-menu a[href="#signout"]');
        if (signOutLink) {
            signOutLink.addEventListener('click', function () {
                fetch(`https://${host}/api/auth/singout/`, {
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
                        console.log('Çıkış yapıldı'); // Çıkış işlemini kontrol et
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("username");
                        window.location.href = '/';
                    } else {
                        console.error('Çıkış yaparken hata oluştu:', response.statusText);
                        showErrorMessage("Çıkış yaparken bir hata oluştu.");
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

export function updateProfileUI(user) {
    const profileNameDisplay = document.getElementById('profileNameDisplay');
    const profileTitleDisplay = document.getElementById('profileTitleDisplay');
    const profileLocationDisplay = document.getElementById('profileLocationDisplay');
    const profileImageDisplay = document.getElementById('profileImageDisplay');
    const profileSmallPhoto = document.getElementById('profileSmallPhoto');

    if (profileNameDisplay) {
        profileNameDisplay.textContent = user.first_name + ' ' + user.last_name;
    }
    if (profileTitleDisplay) {
        profileTitleDisplay.textContent = user.title ? user.title : 'Ayarlanmamış';
    }
    if (profileLocationDisplay) {
        profileLocationDisplay.textContent = user.location ? user.location : 'Ayarlanmamış';
    }
    if (profileImageDisplay) {
        profileImageDisplay.src = user.avatar ? user.avatar : 'img/default-avatar.png';
    }
    if (profileSmallPhoto) {
        profileSmallPhoto.src = user.avatar ? user.avatar : 'img/default-avatar.png';
    }
}

// Hata mesajı gösterme fonksiyonu
function showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Sayfa Yüklendiğinde initProfile Fonksiyonunu Çağır
document.addEventListener('DOMContentLoaded', initProfile);
