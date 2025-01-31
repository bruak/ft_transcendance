// Hakkımızda Sayfasını Başlatma Fonksiyonu
function initializeAboutUs() {
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

// Dinamik script yüklendikten sonra initializeAboutUs fonksiyonunu çağır
initializeAboutUs();

export { initializeAboutUs as initAbout };
