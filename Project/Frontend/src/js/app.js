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
    '/': { html: './views/log-reg.html', init: () => import("/js/log-reg.js").then(({ initLogReg }) => initLogReg()) },
    '/profile/:username': { html: './views/profile.html', init: (params) => import("/js/profileController.js").then(({ initProfileController }) => initProfileController(params)) },
    '/about': { html: './views/about-us.html', init: () => import("/js/about-us.js").then(({ initAbout }) => initAbout()) },
    '/2fac': { html: './views/2factor.html', init: () => import("/js/2fac.js").then(({ init2fac }) => init2fac()) },
    '/GamePage': { html: './views/game.html', init: () => import("/js/game.js").then(({ initGame }) => initGame()) },
    '/a': { html: './admin/index.html', init: () => import("/admin/js/admin.js").then(({ initAdmin }) => initAdmin()) },
    '/forget-password/:token': { html: './views/forgot-password.html', init: (params) => import("./password.js").then(({ initPassword }) => initPassword(params)) },
    '/verify-email/:token': { html: './views/verify_email.html', init: (params) => import("./verify-email.js").then(({ initVerifyEmail }) => initVerifyEmail(params)) },
    '/recover-password': { html: './views/recover-password.html', init: () => import("/js/recover-password.js").then(({ initRecoverPassword }) => initRecoverPassword()) },
    
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
        document.querySelector('#app').innerHTML = `
        <div id="dreamEffect" style="
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background: #000;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
">
	<div class="animated-shape" style="
		position: absolute;
		width: 200px;
		height: 200px;
		background: rgba(255, 0, 0, 0.5);
		border-radius: 50%;
		filter: blur(10px);
		animation: moveShape 6s ease-in-out infinite;
	"></div>
	<div class="animated-shape" style="
		position: absolute;
		width: 150px;
		height: 150px;
		background: rgba(0, 255, 0, 0.5);
		border-radius: 50%;
		filter: blur(10px);
		animation: moveShape 7s ease-in-out infinite;
	"></div>
	<div class="animated-shape" style="
		position: absolute;
		width: 250px;
		height: 250px;
		background: rgba(0, 0, 255, 0.5);
		border-radius: 50%;
		filter: blur(10px);
		animation: moveShape 8s ease-in-out infinite;
	"></div>
	<div id="dreamText" style="
		position: relative;
		z-index: 10;
		color: #fff;
		font-family: 'Courier New', Courier, monospace;
		font-size: 2.5em;
		animation: fadeInOut 5s ease-in-out infinite;
	">
		Sayfa Bulunamadı
	</div>
	<audio id="dreamAudio" src="/Audio/dream-sound.mp3" autoplay loop></audio>
</div>

<style>
	@keyframes moveShape {
		0%   { transform: translate(0, 0) scale(1); opacity: 0.7; }
		25%  { transform: translate(20vw, -10vh) scale(1.2); opacity: 0.8; }
		50%  { transform: translate(-20vw, 10vh) scale(0.8); opacity: 0.6; }
		75%  { transform: translate(10vw, 20vh) scale(1.1); opacity: 0.9; }
		100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
	}
	@keyframes fadeInOut {
		0%, 100% { opacity: 0; }
		50% { opacity: 1; }
	}
</style>

        `;
        return;
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


/* ======================[*] Sayfa Yüklendiğinde ve Geri/İleri Butonlarına Basıldığında Router Fonksiyonunu Çağır [*]====================== */
window.addEventListener('DOMContentLoaded', router);
window.addEventListener('popstate' , () => {
    if (typeof window.cleanup === 'function') {
        window.cleanup();
        delete window.cleanup;
    }
    router();
});

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
