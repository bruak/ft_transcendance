export function initProfile() {
    // const host = window.location.hostname;
    try {
        const host = window.location.host;
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', function (event) {
                event.preventDefault();

                // Form verilerini al
                const name = document.getElementById('profileName').value;
                const title = document.getElementById('profileTitle').value;
                const location = document.getElementById('profileLocation').value;
                const image = document.getElementById('profileImage').files[0];

                // Profil kartını güncelle
                document.getElementById('profileNameDisplay').textContent = name;
                document.getElementById('profileTitleDisplay').textContent = title;
                document.getElementById('profileLocationDisplay').textContent = location;

                // Profil resmini güncelle
                if (image) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        document.getElementById('profileImageDisplay').src = e.target.result;
                        // Profil resmini localStorage'a kaydet
                        localStorage.setItem('profileImage', e.target.result);
                    }
                    reader.readAsDataURL(image);
                }

                // Modalı kapat
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
                modal.hide();
            });
        }

        // Sayfa yüklendiğinde profil resmini localStorage'dan al
        const savedProfileImage = localStorage.getItem('profileImage');
        if (savedProfileImage) {
            document.getElementById('profileImageDisplay').src = savedProfileImage;
            document.getElementById('profileSmallPhoto').src = savedProfileImage;
        }

        console.log(localStorage.getItem("accessToken"));
        // Kullanıcı bilgilerini doldur
        fetch(`https://${host}/users/api/getuser/${localStorage.getItem("username")}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem("accessToken")}`, 'Accept-Language': 'tr' }
        })
        .then(response => response.json())
            .then(user => {
                    console.log("response.JSON", user);
                    document.getElementById('profileNameDisplay').textContent = user.first_name + ' ' + user.last_name;
                    document.getElementById('profileUsernameDisplay').textContent = user.username ? user.username : 'Ayarlanmamış';
                    document.getElementById('profileTitleDisplay').textContent = user.title ? user.title : 'Ayarlanmamış';
                    document.getElementById('profileLocationDisplay').textContent = user.location ? user.location : 'Ayarlanmamış';
                    document.getElementById('profileImageDisplay').src = user.avatar ? user.avatar : 'img/tufan.jpg';
                    console.log("user.avatar", user.avatar);

                    document.getElementById('profileSmallPhoto').src = user.avatar ? user.avatar : 'img/ibrahim.jpg';
                })
            .catch(error => console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', error));

        // Arkadaş ara butonuna tıklama olayını ekle
        document.getElementById('friendSearchButton').addEventListener('click', function () {
            const searchInput = document.getElementById('friendSearchInput').value;
            if (searchInput) {
                fetch(`/api/search-friends?query=${searchInput}`)
                    .then(response => response.json())
                    .then(data => {
                        const suggestionsList = document.getElementById('friendSuggestions');
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
                    })
                    .catch(error => console.error('Arkadaşlar aranırken hata oluştu:', error));
            }
        });

        // Dostlar butonuna tıklama olayını ekle
        document.getElementById('viewFriendsButton').addEventListener('click', function () {
            fetch('/api/friends')
                .then(response => response.json())
                .then(friends => {
                    const friendsList = document.getElementById('friendsList');
                    friendsList.innerHTML = friends.length > 0
                        ? friends.map(friend => `<li class="list-group-item">${friend.name}</li>`).join('')
                        : '<li class="list-group-item">Henüz arkadaşınız yok.</li>';
                })
                .catch(error => console.error('Arkadaşlar yüklenirken hata oluştu:', error));
        });

        // Sign out işlemi
        document.querySelector('.dropdown-menu a[href="#signout"]').addEventListener('click', function () {
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

    } catch (error) {
        console.error('initializeProfile fonksiyonunda hata oluştu:', error);
    }
}

// Dinamik script yüklendikten sonra initProfile fonksiyonunu ça��ır
document.addEventListener('DOMContentLoaded', initProfile);


