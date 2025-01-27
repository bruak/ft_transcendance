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
}

export { openNav, closeNav, initializeProfile as initProfile };
