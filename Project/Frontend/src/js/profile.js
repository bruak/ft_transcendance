// Sidenav Açma Fonksiyonu
function openNav() {
    document.getElementById("myNav").style.width = "30%";
}

// Sidenav Kapatma Fonksiyonu
function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}

// Profil Düzenleme Formunu Başlatma Fonksiyonu
function initializeProfile() {
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Form verilerini al
            const name = document.getElementById('profileName').value;
            const title = document.getElementById('profileTitle').value;
            const location = document.getElementById('profileLocation').value;
            const image = document.getElementById('profileImage').files[0];

            // Profil kartını güncelle
            document.querySelector('.card h1').textContent = name;
            document.querySelector('.card .title').textContent = title;
            document.querySelector('.card p').textContent = location;

            // Profil resmini güncelle
            if (image) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.querySelector('.card img').src = e.target.result;
                }
                reader.readAsDataURL(image);
            }

            // Modalı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            modal.hide();
        });
    }

    // Kullanıcı bilgilerini doldur
    fetch('/api/user-profile')
        .then(response => response.json())
        .then(user => fillUserProfile(user));

    // Arkadaş ara butonuna tıklama olayını ekle
    document.getElementById('friendSearchButton').addEventListener('click', searchFriends);

    // Dostlar butonuna tıklama olayını ekle
    document.getElementById('viewFriendsButton').addEventListener('click', viewFriends);
}

// Kullanıcı bilgilerini doldur
function fillUserProfile(user) {
    document.getElementById('profileNameDisplay').textContent = user.name;
    document.getElementById('profileTitleDisplay').textContent = user.title;
    document.getElementById('profileLocationDisplay').textContent = user.location;
    document.getElementById('profileImageDisplay').src = user.image;
}

// Arkadaş Ara fonksiyonu
function searchFriends() {
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
                    addButton.onclick = () => addFriend(user.id);
                    listItem.appendChild(addButton);
                    suggestionsList.appendChild(listItem);
                });
            });
    }
}

// Arkadaş Ekle fonksiyonu
function addFriend(friendId) {
    fetch(`/api/add-friend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Arkadaş eklendi!');
        } else {
            alert('Arkadaş eklenemedi.');
        }
    });
}

// Dostlar fonksiyonu
function viewFriends() {
    fetch('/api/friends')
        .then(response => response.json())
        .then(friends => {
            const friendsList = document.getElementById('friendsList');
            friendsList.innerHTML = friends.length > 0
                ? friends.map(friend => `<li class="list-group-item">${friend.name}</li>`).join('')
                : '<li class="list-group-item">Henüz arkadaşınız yok.</li>';
        })
        .catch(error => console.error('Arkadaşlar yüklenirken hata oluştu:', error));
}

export { openNav, closeNav, initializeProfile as initProfile, viewFriends };
