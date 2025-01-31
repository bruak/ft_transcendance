
// Önbellek yapısı
const cache = new Map();

async function fetchWithCache(url, cacheTime = 300000) { // 5 dakika
    const now = Date.now();
    if (cache.has(url)) {
        const { timestamp, content } = cache.get(url);
        if (now - timestamp < cacheTime) {
            return content;
        }
    }
    
    const response = await fetch(url);
    if (response.ok) {
        const content = await response.text();
        cache.set(url, { timestamp: now, content });
        return content;
    } else {
        throw new Error("Sayfa yüklenemedi");
    }
}

// Global state yönetimi
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

// Hata mesajı gösterme fonksiyonu
function showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}


// Rota tanımlamaları
const routes = {
    '/': { html: './views/log-reg.html', init: () => import("./log-reg.js").then(({ initLogReg }) => initLogReg()) },
    '/profile': { html: './views/profile.html', init: () => import("./profile.js").then(({ initProfile }) => initProfile()) },
    '/about': { html: './views/about-us.html', init: () => import("./about-us.js").then(({ initAbout }) => initAbout()) },
    '/profile/:id': { html: './views/profile.html', init: () => import("./profile.js").then(({ initProfile }) => initProfile()) },
    '/2fac': { html: './views/2factor.html', init: () => import("./2fac.js").then(({ init2fac }) => init2fac()) },
    '/GamePage': { html: './views/game.html', init: () => import("./game.js").then(({ initGame }) => initGame()) },
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
        const content = await fetchWithCache(route.html);
        document.querySelector('#app').innerHTML = content;
        if (route.init) {
            route.init();
        }
    } catch (err) {
        console.error('Sayfa yüklenirken hata oluştu:', err);
        showErrorMessage("Bir hata oluştu, lütfen tekrar deneyin.");
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

// Örnek: Kullanıcı bilgisi güncellendiğinde profil bileşenini güncelle
document.addEventListener("stateChange:user", (event) => {
    console.log("Kullanıcı bilgisi güncellendi:", event.detail);
    import("./profile.js").then(({ updateProfileUI }) => updateProfileUI(event.detail));
});

// Kullanıcı yetkilendirmesi kontrolü
document.addEventListener("stateChange:user", (event) => {
    if (!event.detail.token) {
        console.log("Kullanıcı oturum açmamış!");
        history.pushState(null, null, "/");
        router();
    }
});

// Yetkilendirme ve güvenlik önlemleri eklemek için aşağıdaki kodu kullanabilirsiniz:
// if (!globalState.user) {
//     history.pushState(null, null, "/");
//     router();
// }

