/**
 * About-Us sayfası için JavaScript modülü
 * Erişilebilirlik, performans ve mobil uyumluluk iyileştirmeleri içerir
 */

/* ======================[*] Navbar İşlemleri [*]====================== */
function initNavbarLinks() {
    try {
        // Navbar'daki Home linkinin href özelliğini username olarak ayarla
        const navbarUsername = localStorage.getItem('username');
        const homeLink = document.getElementById('home');

        if (homeLink) {
            if (navbarUsername) {
                homeLink.href = "profile/" + navbarUsername;
            } else {
                // localStorage'dan username alınamazsa fallback
                console.warn("Username bulunamadı, varsayılan olarak ana sayfaya yönlendirilecek");
                homeLink.href = "/";
            }

            // Erişilebilirlik için aria-label güncelleme
            homeLink.setAttribute('aria-label', `${navbarUsername || 'Home'} profiline git`);
        }
    } catch (error) {
        console.error("Navbar links güncellenirken hata oluştu:", error);
    }
}

/* ======================[*] Animasyon İşlemleri [*]====================== */
function initAnimations() {
    try {
        // Kartlara kademeli animasyon ekle
        const cards = document.querySelectorAll('.card');

        if ('IntersectionObserver' in window) {
            // Sayfa kaydırıldıkça kademeli animasyon için Intersection Observer kullan
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        // Görünür olan kartı fade-in ile göster (hafif gecikme ile)
                        setTimeout(() => {
                            entry.target.classList.add('fade-in');
                        }, index * 100); // Her kart için kademeli gecikme
                        observer.unobserve(entry.target); // Bir kere gösterildikten sonra gözlemi bırak
                    }
                });
            }, { threshold: 0.2 }); // Kartın en az %20'si görünür olduğunda tetikle

            cards.forEach(card => observer.observe(card));
        } else {
            // IntersectionObserver desteklenmiyorsa tüm kartları direkt göster
            cards.forEach(card => card.classList.add('fade-in'));
        }
    } catch (error) {
        console.error("Animasyon başlatılırken hata oluştu:", error);
        // Fallback: Tüm kartları direkt görünür yap
        document.querySelectorAll('.card').forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }
}

/* ======================[*] Link Etkileşimleri [*]====================== */
function setupLinkInteractions() {
    try {
        // Github linkleri için tıklama olayı
        const links = document.querySelectorAll('.card a');

        links.forEach(function (link) {
            // Klavye erişilebilirliği için focus olayı
            link.addEventListener('focus', function () {
                // Kart odaklandığında vurgulamak için kartı seç
                const parentCard = this.closest('.card');
                if (parentCard) parentCard.classList.add('focused');
            });

            link.addEventListener('blur', function () {
                // Focus kaybedildiğinde vurgulamayı kaldır
                const parentCard = this.closest('.card');
                if (parentCard) parentCard.classList.remove('focused');
            });

            // Tıklama olayı - yeni sekmede aç
            link.addEventListener('click', function (event) {
                event.preventDefault();
                window.open(this.href, '_blank', 'noopener,noreferrer');
            });

            // Dokunmatik cihazlar için
            link.addEventListener('touchstart', function () {
                const parentCard = this.closest('.card');
                if (parentCard) parentCard.classList.add('touch-active');
            }, { passive: true });

            link.addEventListener('touchend', function () {
                const parentCard = this.closest('.card');
                setTimeout(() => {
                    if (parentCard) parentCard.classList.remove('touch-active');
                }, 200);
            }, { passive: true });
        });
    } catch (error) {
        console.error("Link etkileşimleri ayarlanırken hata oluştu:", error);
    }
}

/* ======================[*] Klavye Gezintisi İyileştirmesi [*]====================== */
function setupKeyboardNavigation() {
    try {
        // Skip link görünürlüğü
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('focus', function () {
                this.style.top = '0';
            });

            skipLink.addEventListener('blur', function () {
                this.style.top = '-40px';
            });
        }

        // Kartlar arası klavye gezintisi
        const teamCards = document.querySelectorAll('.team-card');
        teamCards.forEach(card => {
            card.addEventListener('keydown', function (event) {
                // Enter veya space ile kart içindeki linki tıkla
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const link = this.querySelector('a');
                    if (link) window.open(link.href, '_blank', 'noopener,noreferrer');
                }
            });
        });
    } catch (error) {
        console.error("Klavye gezintisi ayarlanırken hata oluştu:", error);
    }
}

/* ======================[*] Performans İyileştirmeleri [*]====================== */
function setupPerformanceOptimizations() {
    try {
        // Lazy loading - görsellerin yüklenmesini geciktirme
        const images = document.querySelectorAll('img[loading="lazy"]');
        if ('loading' in HTMLImageElement.prototype) {
            // Tarayıcı native lazy loading destekliyorsa, hiçbir şey yapma
        } else {
            // Tarayıcı lazy loading desteklemiyorsa, intersection observer kullan
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => {
                if (img.dataset.src) {
                    imageObserver.observe(img);
                }
            });
        }
    } catch (error) {
        console.error("Performans optimizasyonları ayarlanırken hata oluştu:", error);
    }
}

/* ======================[*] Hakkımızda Sayfasını Başlatma Fonksiyonu [*]====================== */
export function initAbout() {


    // Tüm alt modülleri başlat
    initNavbarLinks();
    initAnimations();
    setupLinkInteractions();
    setupKeyboardNavigation();
    setupPerformanceOptimizations();

    // Sayfa tamamen yüklendiğinde animasyonları başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimations);
    } else {
        initAnimations();
    }

    // Ekranın görünürlüğü değiştiğinde (örn. sekme değişikliği) animasyonları kontrol et
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            initAnimations();
        }
    });


}
