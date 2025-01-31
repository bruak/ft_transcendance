// Hakkımızda Sayfasını Başlatma Fonksiyonu
export function initAbout() {

    // Navbar içeriğini yükleme
    fetch('/views/navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
        console.log('Navbar yüklendi'); // Navbar'ın yüklendiğini kontrol et
    })
    .catch(error => console.error('Navbar yüklenirken hata oluştu:', error));
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Mesajınız gönderildi!');
        });
    }

    // Kartları fade-in animasyonu ile göster
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('fade-in');
    });

    // Kart linklerine tıklamayı yakala ve yeni sekmede aç
    const links = document.querySelectorAll('.card a');
    links.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            window.open(this.href, '_blank');
        });
    });
}

document.addEventListener('DOMContentLoaded', initAbout);

