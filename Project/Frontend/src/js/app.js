import { initLogReg } from './log-reg.js';
import { initProfile } from './profile.js';
import { initAbout } from './about-us.js';
import { init2fac } from './2fac.js';
import { initGame } from './game.js';

// Önbellek yapısı
const cache = new Map();

// Global state yönetimi
const globalState = {
    user: null,
    // Diğer global state değişkenleri buraya eklenebilir
};

function setState(key, value) {
    globalState[key] = value;
}

function getState(key) {
    return globalState[key];
}

// Rota tanımlamaları
const routes = {
    '/': { html: './views/log-reg.html', init: initLogReg },
    '/profile': { html: './views/profile.html', init: initProfile },
    '/about': { html: './views/about-us.html', init: initAbout },
    // Dinamik rota örneği
    '/profile/:id': { html: './views/profile.html', init: initProfile },
    '/2fac': { html: './views/2factor.html', init: init2fac },
    '/game': { html: './views/game.html', init: initGame },
};

// Router fonksiyonu
async function router() {
    const path = window.location.pathname;
    let route = routes[path] || routes['/'];

    // Dinamik rota kontrolü
    for (const [key, value] of Object.entries(routes)) {
        const regex = new RegExp(`^${key.replace(/:\w+/g, '\\w+')}$`);
        if (regex.test(path)) {
            route = value;
            break;
        }
    }

    document.querySelector('#app').innerHTML = `<h1>Loading...</h1>`; // Loading durumu

    try {
        if (cache.has(route.html)) {
            const content = cache.get(route.html);
            document.querySelector('#app').innerHTML = content;
            if (route.init) {
                route.init();
            }
        } else {
            const response = await fetch(route.html); // HTML içeriğini al
            if (response.ok) {
                const content = await response.text();
                cache.set(route.html, content); // Önbelleğe ekle
                document.querySelector('#app').innerHTML = content;
                if (route.init) {
                    route.init();
                }
            } else {
                document.querySelector('#app').innerHTML = `<h1>404 - Sayfa Bulunamadı</h1>`;
            }
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

