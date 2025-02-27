/* ======================[*] Hakkımızda Sayfasını Başlatma Fonksiyonu [*]====================== */
export function initAbout() {

    const username = localStorage.getItem('username');

    // Navbar'daki Home linkinin href özelliğini username olarak ayarla
    const navbarUsername = localStorage.getItem('username');
    const homeLink = document.getElementById('home');
    if (homeLink && navbarUsername) {
      homeLink.href = "profile/" + navbarUsername;
    }

    /* ======================[*] Kartları Fade-in Animasyonu ile Göster [*]====================== */
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('fade-in');
    });

    /* ======================[*] Kart Linklerine Tıklamayı Yakala ve Yeni Sekmede Aç [*]====================== */
    const links = document.querySelectorAll('.card a');
    links.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            window.open(this.href, '_blank');
        });
    });
}

/* ======================[*] Sayfa Yüklendiğinde initAbout Fonksiyonunu Çağır [*]====================== */
document.addEventListener('DOMContentLoaded', initAbout);

