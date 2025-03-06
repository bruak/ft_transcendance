/* ======================[*] Önbellek Yapısı [*]====================== */
const cache = new Map();
async function fetchWithCache(url, cacheTime = 300000) { // 5 dakika
    try {
        const now = Date.now();
        if (cache.has(url)) {
            const { timestamp, content } = cache.get(url);
            if (now - timestamp < cacheTime) {
                return content;
            }
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Hatası: ${response.error}`);

        const content = await response.text();
        cache.set(url, { timestamp: now, content });
        return content;
    } catch (error) {
        console.error("fetchWithCache Hata:", error);
        showErrorMessage("Veri yüklenirken hata oluştu.");
        return ""; // Hata durumunda boş string dönelim.
    }
}

/* ======================[*] Global State Yönetimi [*]====================== */
const globalState = new Proxy(
    {
        user: {
            username: localStorage.getItem("username"),
            token: localStorage.getItem("accessToken")
        },
        // Diğer global state değişkenleri buraya eklenebilir
    },
    {
        set(target, key, value) {
            target[key] = value;
            document.dispatchEvent(new CustomEvent(`stateChange:${key}`, { detail: value }));
            return true;
        },
    }
);

export function setState(key, value) {
    globalState[key] = value;
}

export function getState(key) {
    return globalState[key];
}

/* ======================[*] Hata Mesajı Gösterme Fonksiyonu [*]====================== */
function showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

/* ======================[*] Rota Tanımlamaları [*]====================== */
const routes = {
    '/': { html: '/views/log-reg.html', init: () => import("/js/log-reg.js").then(({ initLogReg }) => initLogReg()) },
    '/profile/:username': { html: '/views/profile.html', init: (params) => import("/js/profileController.js").then(({ initProfileController }) => initProfileController(params)) },
    '/about': { html: '/views/about-us.html', init: () => import("/js/about-us.js").then(({ initAbout }) => initAbout()) },
    '/2fac': { html: '/views/2factor.html', init: () => import("/js/2fac.js").then(({ init2fac }) => init2fac()) },
    '/GamePage': { html: '/views/game.html', init: () => import("/js/game.js").then(({ initGame }) => initGame()) },
    '/a': { html: '/admin/index.html', init: () => import("/admin/js/admin.js").then(({ initAdmin }) => initAdmin()) },
    '/forget-password/:token': { html: '/views/forgot-password.html', init: (params) => import("/password.js").then(({ initPassword }) => initPassword(params)) },
    '/verify-email/:token': { html: '/views/verify_email.html', init: (params) => import("/js/verify-email.js").then(({ initVerifyEmail }) => initVerifyEmail(params)) },
    '/recover-password': { html: '/views/recover-password.html', init: () => import("/js/recover-password.js").then(({ initRecoverPassword }) => initRecoverPassword()) },
    '/callback/': { html: '/views/callback.html' },
    '/404': { html: '/views/404.html' } // 404 sayfası için yeni rota eklendi
};

/* ======================[*] Router Fonksiyonu [*]====================== */

export async function router() {
    const path = window.location.pathname;
    let route = routes[path] || null;
    let params = {};

    // Dinamik rota kontrolü
    if (!route) {
        for (const [key, value] of Object.entries(routes)) {
            const paramNames = [];
            const regexPath = key.replace(/:\w+/g, (match) => {
                paramNames.push(match.substring(1));
                return '([^/]+)';
            });
            const regex = new RegExp(`^${regexPath}$`);
            const match = path.match(regex);
            if (match) {
                route = value;
                params = paramNames.reduce((acc, paramName, index) => {
                    acc[paramName] = match[index + 1];
                    return acc;
                }, {});
                break;
            }
        }
    }

    if (!route) {
        route = routes['/404'];
    }

    document.querySelector('#app').innerHTML = '<h1>Loading...</h1>'; // Loading durumu

    try {
        const content = await fetchWithCache(route.html);
        document.querySelector('#app').innerHTML = content;
        if (route.init) {
            route.init(params);
        }
    } catch (err) {
        console.error('Sayfa yüklenirken hata oluştu:', err);
        showErrorMessage("Bir hata oluştu, lütfen tekrar deneyin.");
        document.querySelector('#app').innerHTML = '<h1>Sayfa yüklenirken bir hata oluştu.</h1>';
    }
}

/* ======================[*] Link Tıklamalarını Yakala ve Router Fonksiyonunu Çağır [*]====================== */
document.addEventListener('click', (event) => {
    const target = event.target.closest('a[data-link]');
    if (target) {
        event.preventDefault();
        const href = target.getAttribute('href');
        history.pushState(null, null, href);
        if (typeof window.cleanupProfile === 'function') {
            window.cleanupProfile();
            delete window.cleanupProfile;
        }
        if (typeof window.cleanup === 'function')
        {
            window.cleanup();
            delete window.cleanup;
        }
        router(); // Sayfayı güncelle
    }
});


/* ======================[*] Sayfa Yüklendiğinde ve Geri/İleri Butonlarına Basıldığında Router Fonksiyonunu Çağır [*]====================== */
window.addEventListener('DOMContentLoaded', router);
window.addEventListener('popstate', () => {

    // Açık modalları kapat
    document.querySelectorAll('.modal.show').forEach(function(modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
        modalInstance.hide();
        }
    });
    // Modal backdrop'ı kaldır
    document.querySelectorAll('.modal-backdrop').forEach(function(backdropEl) {
        backdropEl.remove();
    });

    
    if (typeof window.cleanupProfile === 'function') {
        window.cleanupProfile();
        delete window.cleanupProfile;
    }
    if (typeof window.cleanup === 'function')
    {
        window.cleanup();
        delete window.cleanup;
    }
    router();
});

/* ======================[*] Kullanıcı Bilgisi Güncellendiğinde Profil Bileşenini Güncelle [*]====================== */
document.addEventListener("stateChange:user", (event) => {
    import("/js/profile.js").then(({ updateProfileUI }) => updateProfileUI(event.detail));
});

/* ======================[*] Kullanıcı Yetkilendirmesi Kontrolü [*]====================== */
document.addEventListener("stateChange:user", (event) => {
    if (!event.detail.token) {
        history.pushState(null, null, "/");
        router();
    }
});

/* ======================[*] Yetkilendirme ve Güvenlik Önlemleri [*]====================== */
// if (!globalState.user) {
//     history.pushState(null, null, "/");
//     router();
// }
