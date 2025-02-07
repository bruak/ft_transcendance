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
        if (!response.ok) throw new Error(`HTTP Hatası: ${response.status}`);
        
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

function setState(key, value) {
    globalState[key] = value;
}

function getState(key) {
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
    '/': { html: './views/log-reg.html', init: () => import("./log-reg.js").then(({ initLogReg }) => initLogReg()) },
    '/:username': { html: './views/profile.html', init: (params) => import("./profile.js").then(({ initProfile }) => initProfile(params)) },
    '/about': { html: './views/about-us.html', init: () => import("./about-us.js").then(({ initAbout }) => initAbout()) },
    '/2fac': { html: './views/2factor.html', init: () => import("./2fac.js").then(({ init2fac }) => init2fac()) },
    '/GamePage': { html: './views/game.html', init: () => import("./game.js").then(({ initGame }) => initGame()) },
};

/* ======================[*] Router Fonksiyonu [*]====================== */
export async function router() {
    const path = window.location.pathname;
    let route = routes[path] || null;
    let params = {};

    // Dinamik rota kontrolü
    if (!route)
    {
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
        // console.log('Params:', params); // params konsole yazdır
    }


    if (!route) {
        document.querySelector('#app').innerHTML = `<h1>Sayfa bulunamadı.</h1>`;
        return;
    }


    document.querySelector('#app').innerHTML = `<h1>Loading...</h1>`; // Loading durumu

    try {
        const content = await fetchWithCache(route.html);
        document.querySelector('#app').innerHTML = content;
        if (route.init) {
            route.init(params);
        }
    } catch (err) {
        console.error('Sayfa yüklenirken hata oluştu:', err);
        showErrorMessage("Bir hata oluştu, lütfen tekrar deneyin.");
        document.querySelector('#app').innerHTML = `<h1>Sayfa yüklenirken bir hata oluştu.</h1>`;
    }
}

/* ======================[*] Link Tıklamalarını Yakala ve Router Fonksiyonunu Çağır [*]====================== */
document.addEventListener('click', (event) => {
    const target = event.target.closest('a[data-link]');
    if (target) {
        event.preventDefault();
        const href = target.getAttribute('href');
        history.pushState(null, null, href);
        router(); // Sayfayı güncelle
    }
});

/* ======================[*] Sayfa Yüklendiğinde ve Geri/İleri Butonlarına Basıldığında Router Fonksiyonunu Çağır [*]====================== */
window.addEventListener('DOMContentLoaded', router);
window.addEventListener('popstate', router);

/* ======================[*] Kullanıcı Bilgisi Güncellendiğinde Profil Bileşenini Güncelle [*]====================== */
document.addEventListener("stateChange:user", (event) => {
    // console.log("Kullanıcı bilgisi güncellendi:", event.detail);
    import("./profile.js").then(({ updateProfileUI }) => updateProfileUI(event.detail));
});

/* ======================[*] Kullanıcı Yetkilendirmesi Kontrolü [*]====================== */
document.addEventListener("stateChange:user", (event) => {
    if (!event.detail.token) {
        // console.log("Kullanıcı oturum açmamış!");
        history.pushState(null, null, "/");
        router();
    }
});

/* ======================[*] Yetkilendirme ve Güvenlik Önlemleri [*]====================== */
// if (!globalState.user) {
//     history.pushState(null, null, "/");
//     router();
// }

