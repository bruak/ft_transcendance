/* ======================[*] Hakkımızda Sayfasını Başlatma Fonksiyonu [*]====================== */
export function initAbout() {

    /* ======================[*] Navbar İçeriğini Yükleme [*]====================== */
    fetch('/views/navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
    })
    .catch(error => console.error('Navbar yüklenirken hata oluştu:', error));

    /* ======================[*] Form İşleme [*]====================== */
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Mesajınız gönderildi!');
        });
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

