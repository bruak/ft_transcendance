import { initLogReg } from './log-reg.js';
import { initProfile } from './profile.js';
import { initAbout } from './about-us.js';

// Rota tanımlamaları
const routes = {
    '/': { html: './views/log-reg.html', init: initLogReg },
    '/profile': { html: './views/profile.html', init: initProfile },
    '/about': { html: './views/about-us.html', init: initAbout },
};

// Router fonksiyonu
async function router() {
    const path = window.location.pathname;
    const route = routes[path] || routes['/'];

    try {
        const response = await fetch(route.html); // HTML içeriğini al
        if (response.ok) {
            const content = await response.text();
            document.querySelector('#app').innerHTML = content;

            // Sayfaya özgü fonksiyonu çağır
            if (route.init) {
                route.init();
            }
        } else {
            document.querySelector('#app').innerHTML = `<h1>404 - Sayfa Bulunamadı</h1>`;
        }
    } catch (err) {
        console.error('Sayfa yüklenirken hata oluştu:', err);
        document.querySelector('#app').innerHTML = `<h1>Sayfa yüklenirken bir hata oluştu.</h1>`;
    }
}

// Link tıklamalarını yakala ve router fonksiyonunu çağır
document.addEventListener('click', (event) => {
    const target = event.target.closest('a[data-link]');
    if (target) {
        event.preventDefault();
        const href = target.getAttribute('href');
        history.pushState(null, null, href);
        router(); // Sayfayı güncelle
    }
});

// Sayfa yüklendiğinde ve geri/ileri butonlarına basıldığında router fonksiyonunu çağır
window.addEventListener('DOMContentLoaded', router);
window.addEventListener('popstate', router);
