// Form gönderimi için olay dinleyici
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Mesajınız gönderildi!');
});

// Sayfa yüklendiğinde animasyon eklemek için
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('fade-in');
    });
});
