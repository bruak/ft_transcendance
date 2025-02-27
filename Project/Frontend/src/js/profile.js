/**
 * profile.js (yenilendi)
 *
 * - Kullanıcı profil sayfasını başlatma (initProfile)
 * - Profil bilgilerini güncelleme (updateProfileUI)
 * - Arkadaş arama & ekleme
 * - Gelen istekleri listeleme & kabul
 * - Arkadaş listesini gösterme
 * - Oyun seçenekleri (turnuva, maç, vb.)
 * - Çıkış yapma (sign out)
 * - Hata & Toast bildirimleri
 */

import { router, setState, getState } from "./app.js";

/* --------------------------------------------------------------------------
   1) API Fonksiyonları (Tek Noktada Toplanmış)
   Burada, proje içinde kullandığın çeşitli endpoint'lere fetch atarak verileri
   almak/göndermek için async/await tarzında fonksiyonlar tanımlıyoruz.
   -------------------------------------------------------------------------- */

const host = window.location.host;
const apiBaseUrl = `https://${host}/api`;
const accessToken = localStorage.getItem("accessToken") || "";

/** GET user profile data */
async function apiGetUser(username) {
  const response = await fetch(`${apiBaseUrl}/user/getuser/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    throw new Error(`Kullanıcı bilgisi çekilirken hata: ${response.status}`);
  }
  return response.json();
}

/** POST to update user profile (FormData gönderiliyor) */
async function apiUpdateUserProfile(formData) {
  const response = await fetch(`${apiBaseUrl}/user/update_profile/`, {
    method: 'POST',
    headers: {
      // multipart/form-data olduğundan otomatik atanıyor
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });
  return response.json();
}

/** GET user search */
async function apiSearchUser(searchValue) {
  const response = await fetch(`${apiBaseUrl}/user/search/${searchValue}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  if (response.status === 401) {
    // Örnek: Giriş yoksa anasayfa
    history.pushState(null, null, '/');
    router();
    throw new Error('Yetkilendirme hatası');
  }
  return response.json();
}

/** POST send friend request */
async function apiSendFriendRequest(username, friendUsername) {
  const response = await fetch(`${apiBaseUrl}/friend/send_friend_request/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      "username": username,
      "friend": friendUsername
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Arkadaşlık isteği gönderilirken hata: ${response.status}`);
  }
  return data;
}

/** GET friend requests */
async function apiListFriendRequests(username) {
  const response = await fetch(`${apiBaseUrl}/friend/list_friend_requests/${username}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  if (response.status === 404) {
    return { notFound: true };
  }
  if (!response.ok) {
    throw new Error(`Arkadaşlık istekleri listelenirken hata: ${response.status}`);
  }
  return response.json();
}

/** POST accept friend request */
async function apiAcceptFriendRequest(username, friendname) {
  const response = await fetch(`${apiBaseUrl}/friend/accept_friend_request/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ username, friendname })
  });
  if (!response.ok) {
    throw new Error(`Arkadaşlık isteği kabul edilirken hata: ${response.status}`);
  }
  return response.json();
}

/** GET friends list */
async function apiListFriends(username) {
  const response = await fetch(`${apiBaseUrl}/friend/friends/${username}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    throw new Error(`Arkadaş listesi alınırken hata: ${response.status}`);
  }
  return response.json();
}

/** GET active tournaments */
async function apiGetActiveTournaments() {
  const response = await fetch(`${apiBaseUrl}/game/active-tournaments/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
}

/** POST create tournament */
async function apiCreateTournament(tournamentData) {
  const response = await fetch(`${apiBaseUrl}/game/create-tournament/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(tournamentData)
  });
  return response.json();
}

/** POST random match */
async function apiRandomMatch() {
  const response = await fetch(`${apiBaseUrl}/game/random-match/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ username: localStorage.getItem('username') })
  });
  return response.json();
}

/** POST bot match */
async function apiBotMatch() {
  const response = await fetch(`${apiBaseUrl}/game/bot-match/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ username: localStorage.getItem('username') })
  });
  return response.json();
}

/** GET playing matches (recent activities) */
async function apiGetPlayingMatches() {
  const response = await fetch(`${apiBaseUrl}/game/playing-matches/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
}

/** GET sign out */
async function apiSignOut() {
  const response = await fetch(`${apiBaseUrl}/auth/singout/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

async function apiJoinTournament(tournamentId)
{
    const response = await fetch(`${apiBaseUrl}/game/tournament/${tournamentId}/join/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'tr',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ username: localStorage.getItem('username') }) 
    });
    if (!response.ok) {
      throw new Error(`Turnuvaya katılırken bir hata oluştu: ${response.status}`);
    }
    return response.json();
}

async function apiStartTournament(tournamentId)
{
  const response = await fetch(`${apiBaseUrl}/game/tournament/${tournamentId}/start/`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'tr',
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ username: localStorage.getItem('username') })
  });
  if (!response.ok)
  {
    throw new Error(`Turnuva başlatılırken bir hata oluştu: ${response.status}`);
  }
}

/* --------------------------------------------------------------------------
   2) initProfile: Sayfa ilk yüklendiğinde çağrılır.
   Aşamaları daha küçük fonksiyonlara böldük.
   -------------------------------------------------------------------------- */
export async function initProfile(params = {}) {
  try {
    // Adım 1: Navbar ayarları
    setupNavbarLinks();

    // Adım 2: Kim hangi profili görüntüleyecek?
    const routeUser = params.username || null;
    console.log("routeUser: ", routeUser);
    const currentUser = localStorage.getItem('username') || null;
    console.log("currentUser: ", currentUser);
    const userToLoad = routeUser || currentUser;
    console.log("userToLoad: ", userToLoad);
    if (!userToLoad) {
      console.error('No username found to load profile.');
      return;
    }
    const isOwnProfile = (userToLoad === currentUser);

    // Adım 3: Profil bilgisi çek ve UI güncelle
    await loadProfileData(userToLoad, isOwnProfile);

    // Adım 4: Profil düzenleme formu (sadece kendi profilinde görünür)
    setupProfileForm(isOwnProfile);

    // Adım 5: Arkadaş arama
    setupFriendSearch();

    // Adım 6: Gelen istekler butonu
    setupFriendRequestsButton(userToLoad);

    // Adım 7: Arkadaşlar listesi butonu
    setupFriendsButton(userToLoad, currentUser);

    // Adım 8: Oyun seçenekleri
    setupGameOptions();

    // Aktif turnuvaları yükle ve akordiyon oluştur
    await setupActiveTournamentsAccordion();

    // Adım 9: Çıkış yapma
    setupSignOutLink();

    // Adım 10: Son etkinlikleri getir
    await loadRecentActivities();

    // Opsiyonel: Bir cleanup fonksiyonu tanımlayıp window'a atayabilirsin
    window.cleanupProfile = cleanupProfile;
  } catch (error) {
    console.error('initProfile hata:', error);
    showErrorMessage("Profil yüklenirken bir hata oluştu.");
  }
}

/* --------------------------------------------------------------------------
   Fonksiyonlar: initProfile içinde çağrılan yardımcı fonksiyonlar
   -------------------------------------------------------------------------- */

/** Navbar linklerini routeUser'a göre ayarla */
function setupNavbarLinks() {
  const navbarUsername = localStorage.getItem('username');
  const homeLink = document.getElementById('home');
  if (homeLink && navbarUsername) {
    homeLink.href = navbarUsername;
  }
}

/** Sunucudan user verisini çekip arayüzü güncelle */
async function loadProfileData(userToLoad, isOwnProfile) {
  const user = await apiGetUser(userToLoad);
  updateProfileUI(user);

  if (user.notifications) {
    updateNotifications(user.notifications);
  }
  // Başkasının profilindeysek düzenleme aksiyonlarını gizle
  if (!isOwnProfile) {
    const profileActions = document.getElementById('profileActions');
    if (profileActions) {
      profileActions.style.display = 'none';
    }
  }
}

/** Profil ayarları formunu yönet */
function setupProfileForm(isOwnProfile) {
  const settingsForm = document.getElementById('settingsForm');
  if (!settingsForm) return;

  if (!isOwnProfile) {
    // Başkasının profilinde formu gizle
    settingsForm.style.display = 'none';
  } else {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(settingsForm);
      try {
        const data = await apiUpdateUserProfile(formData);
        if (data.success) {
          updateProfileUI(data);
        } else {
          console.error('Profil güncellenemedi:', data.message || 'Bilinmeyen hata.');
        }
      } catch (err) {
        console.error('Profil güncellerken hata:', err);
        showErrorMessage("Profil güncellenirken bir hata oluştu.");
      }
    });
  }
}

/** Arkadaş arama alanı ve event listener */
function setupFriendSearch() {
  const friendSearchInput = document.getElementById('friendSearchInput');
  if (!friendSearchInput) return;

  friendSearchInput.addEventListener('input', debounce(async () => {
    const searchValue = friendSearchInput.value.trim();
    const suggestionsList = document.getElementById('friendSuggestions');
    if (!suggestionsList) return;
    console.log("asfas")
    if (searchValue.length >= 3) {
      suggestionsList.innerHTML = '<li class="list-group-item">Yükleniyor...</li>';
      suggestionsList.style.display = 'block';
      try {
        const result = await apiSearchUser(searchValue);
        suggestionsList.innerHTML = '';
        if (Array.isArray(result.data) && result.data.length > 0) {
          result.data.forEach(u => createSuggestionItem(u, suggestionsList));
        } else if (result.data && typeof result.data === 'object') {
          createSuggestionItem(result.data, suggestionsList);
        } else {
          suggestionsList.innerHTML = '<li class="list-group-item">Sonuç bulunamadı.</li>';
        }
      } catch (error) {
        console.error('Arkadaş aramada hata:', error);
        suggestionsList.innerHTML = '<li class="list-group-item text-danger">Arama sırasında hata oluştu.</li>';
      }
    } else {
      suggestionsList.innerHTML = '';
      suggestionsList.style.display = 'none';
    }
  }, 500));
}

/** Arkadaş araması sonucu tıklanabilir liste elemanı yaratır */
function createSuggestionItem(userObj, suggestionsList) {
  const currentUser = localStorage.getItem('username');
  const listItem = document.createElement('li');
  listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

  const userNameLink = document.createElement('a');
  userNameLink.href = `/${userObj.username}`;
  userNameLink.textContent = `${userObj.first_name} ${userObj.last_name}`;
  userNameLink.className = 'text-decoration-none text-white';

  // SPA yönlendirme
  userNameLink.addEventListener('click', function (e) {
    e.preventDefault();
    history.pushState(null, null, this.href);
    router();
  });

  listItem.appendChild(userNameLink);

  // Arkadaş Ekle
  const addButton = document.createElement('button');
  addButton.className = 'btn btn-primary btn-sm';
  addButton.textContent = 'Arkadaş Ekle';

  if (currentUser && userObj.username) {
    addButton.onclick = () => sendFriendRequest(currentUser, userObj.username);
  } else {
    addButton.onclick = () => alert("Arkadaş eklemek için giriş yapmalısınız.");
  }

  listItem.appendChild(addButton);
  suggestionsList.appendChild(listItem);
}

/** Arkadaşlık isteği gönderme */
async function sendFriendRequest(username, friendUsername) {
  try {
    await apiSendFriendRequest(username, friendUsername);
    showToast(`Arkadaşlık isteği gönderildi: ${friendUsername}`);
  } catch (error) {
    showToast(`Arkadaşlık isteği gönderilemedi: ${error.message}`, 'danger');
  }
}

/** Gelen istekler butonu */
function setupFriendRequestsButton(userToLoad) {
  const showRequestsBtn = document.getElementById('requestsMenu');
  if (!showRequestsBtn) return;

  showRequestsBtn.addEventListener('click', async () => {
    const modal = document.getElementById('requestsModal');
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
      // modal kapanınca temizleme işlemi istersen
    });

    await showFriendRequestsSection(userToLoad);
  });
}

/** Gelen istekleri listele & kabul et */
async function showFriendRequestsSection(username) {
  const friendRequestsContainer = document.getElementById('friendRequestsContainer');
  if (!friendRequestsContainer) return;

  try {
    const data = await apiListFriendRequests(username);
    const requests = data.data || [];
    if (requests.length === 0) {
      friendRequestsContainer.innerHTML = `<p>Gelen arkadaşlık isteği yok.</p>`;
      return;
    }

    let html = '<ul class="list-group">';
    requests.forEach(req => {
      html += `
        <li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
          <span>${req.username} sana arkadaşlık isteği gönderdi</span>
          <button class="btn btn-sm btn-primary" data-friend="${req.username}">
            Kabul Et
          </button>
        </li>`;
    });
    html += '</ul>';
    friendRequestsContainer.innerHTML = html;

    const acceptButtons = friendRequestsContainer.querySelectorAll('button[data-friend]');
    acceptButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const friendname = btn.getAttribute('data-friend');
        try {
          const result = await apiAcceptFriendRequest(username, friendname);
          if (result.success) {
            showToast(`${friendname} arkadaşlık isteğinizi kabul etti.`, 'success');
            btn.parentElement.remove();
          } else {
            showToast(`Arkadaşlık isteği kabul edilemedi: ${result.message}`, 'danger');
          }
        } catch (err) {
          console.error('İstek kabul hatası:', err);
          showToast(`Arkadaşlık isteği kabul edilemedi: ${err.message}`, 'danger');
        }
      });
    });
  } catch (err) {
    console.error('listFriendRequests hata:', err);
    friendRequestsContainer.innerHTML = `<p class="text-danger">Arkadaşlık istekleri yüklenirken hata oluştu.</p>`;
  }
}

/** Arkadaşlar modal butonu */
function setupFriendsButton(userToLoad, currentUser) {
  const showFriendsBtn = document.getElementById('viewFriendsButton');
  if (!showFriendsBtn) return;

  showFriendsBtn.addEventListener('click', async () => {
    const modal = document.getElementById('friendsModal');
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
      // modal kapanınca temizleme işlemi istersen
    });

    await showFriendsSection(userToLoad, currentUser);
  });
}

/** Arkadaş listesini göster */
async function showFriendsSection(userToLoad, currentUser) {
  const friendsContainer = document.getElementById('friendsList');
  if (!friendsContainer) return;

  try {
    const data = await apiListFriends(userToLoad);
    const friendsArr = data.data || [];
    if (friendsArr.length === 0) {
      friendsContainer.innerHTML = `<p>Henüz arkadaş bulunmuyor.</p>`;
      return;
    }

    let html = '<ul class="list-group">';
    friendsArr.forEach(friendObj => {
      const friendUsername = friendObj.friendname;
      const showRemove = (userToLoad === currentUser);
      html += `
        <li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
          <span><span class="badge bg-success me-2"><i class="bi bi-person-check"></i></span>${friendUsername}</span>
          ${showRemove ? `
            <button class="btn btn-sm btn-danger" data-friend="${friendUsername}">
              Kaldır
            </button>` : ''}
        </li>`;
    });
    html += '</ul>';
    friendsContainer.innerHTML = html;

    // Arkadaş kaldırmayı aktif etmek istersen
    // ...
  } catch (err) {
    console.error('listFriends hata:', err);
    friendsContainer.innerHTML = `<p class="text-danger">Arkadaş listesi yüklenirken hata oluştu.</p>`;
  }
}

/** Oyun Seçenekleri */
function setupGameOptions() {
  const gameOptionButtons = document.querySelectorAll('.game-option-button');
  gameOptionButtons.forEach(btn => {
    btn.addEventListener('click', async function () {
      const selectedCard = this.closest('.game-option-card');
      const optionId = selectedCard.getAttribute('data-option');
      const optionTitle = selectedCard.querySelector('h3').textContent;

      document.getElementById('gameOptionsModalLabel').textContent = `${optionTitle} Seçenekleri`;
      const hiddenOptions = document.getElementById('hiddenOptions');
      const optionContent = hiddenOptions.querySelector(`#${optionId}`).cloneNode(true);

      const modalContent = document.getElementById('modalContent');
      modalContent.innerHTML = '';
      modalContent.appendChild(optionContent);

      // Turnuva veya Rastgele Maç gibi alt fonksiyonlar
      if (optionId === 'tournamentOptions') {
        await loadActiveTournaments(optionContent);
        setupTournamentCreation(optionContent);
      } else if (optionId === 'onlineOptions') {
        setupRandomMatch(optionContent);
      } else if (optionId === 'aiOptions') {
        setupBotMatch(optionContent);
      }

      const modal = document.getElementById('gameOptionsModal');
      modal.classList.add('animate__animated', 'animate__fadeInDown');
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();

      modal.addEventListener('hidden.bs.modal', () => {
        modal.classList.remove('animate__animated', 'animate__fadeInDown');
      });
    });
  });
}

/** Aktif turnuvaları yükle */
async function loadActiveTournaments(optionContent) {
  try {
    const data = await apiGetActiveTournaments();
    const tournaments = data.data;
    const activeTournamentsList = optionContent.querySelector('#activeTournamentsList');
    if (activeTournamentsList) {
      if (tournaments && tournaments.length > 0) {
        activeTournamentsList.innerHTML = tournaments.map(t => {
          return `<li class="list-group-item bg-dark text-white">
                      <i class="bi bi-trophy icon"></i>
                      ${t.name}
                      <span class="badge">${t.start_date}</span>
                  </li>`;
        }).join('');
      } else {
        activeTournamentsList.innerHTML = '<li class="list-group-item bg-dark text-white">Henüz turnuva yok.</li>';
      }
    }
  } catch (error) {
    console.error('Aktif turnuvalar yüklenirken hata oluştu:', error);
    showErrorMessage("Aktif turnuvalar yüklenirken bir hata oluştu.");
  }
}

/** Turnuva oluşturma */
function setupTournamentCreation(optionContent) {
  const tournamentMatchBtn = optionContent.querySelector('#createTournamentBtn');
  if (!tournamentMatchBtn) return;

  tournamentMatchBtn.addEventListener('click', async () => {
    const tournamentData = {
      name: optionContent.querySelector('#tournamentName').value,
      player_count: optionContent.querySelector('#playerCount').value,
      start_date: optionContent.querySelector('#startDate').value,
      end_date: optionContent.querySelector('#endDate').value,
      username: localStorage.getItem('username'),
      created_by: localStorage.getItem('username')
    };
    try {
      await apiCreateTournament(tournamentData);
      // Turnuva oluşturulduktan sonra aktif turnuvalar listesini yenile
      await loadActiveTournaments(optionContent);
    } catch (err) {
      console.error('Turnuva oluşturulurken hata:', err);
    }
  });
}

/** Online->Rastgele maç */
function setupRandomMatch(optionContent) {
  const randomMatchBtn = optionContent.querySelector('.btn-outline-info');
  if (!randomMatchBtn) return;

  if (randomMatchBtn.textContent.includes('Rastgele Maç')) {
    randomMatchBtn.addEventListener('click', async () => {
      try {
        const data = await apiRandomMatch();
        if (data.data && data.data.detail_url) {
          setState('detail_url', data.data.detail_url);
          history.pushState(null, null, '/GamePage');
          router();
        }
      } catch (err) {
        console.error('Rastgele maç istek hatası:', err);
      }
    });
  }
}

/** Bot maç (AI) */
function setupBotMatch(optionContent) {
  const botMatchBtn = optionContent.querySelector('.btn-success');
  if (!botMatchBtn) return;

  if (botMatchBtn.textContent.includes('Başlat')) {
    botMatchBtn.addEventListener('click', async () => {
      try {
        const data = await apiBotMatch();
        if (data.data && data.data.detail_url) {
          setState('detail_url', data.data.detail_url);
          history.pushState(null, null, '/GamePage');
          router();
        }
      } catch (err) {
        console.error('Bot maç istek hatası:', err);
      }
    });
  }
}

/** Çıkış yapma */
function setupSignOutLink() {
  const signOutLink = document.querySelector('.dropdown-menu a[href="#signout"]');
  if (!signOutLink) return;

  signOutLink.addEventListener('click', async () => {
    try {
      const response = await apiSignOut();
      if (response.ok) {
        localStorage.clear();
        history.pushState(null, null, '/');
        router();
      } else {
        throw new Error('Çıkış yaparken hata oluştu.');
      }
    } catch (error) {
      console.error('Çıkış yaparken hata oluştu:', error);
      showErrorMessage("Çıkış yaparken bir hata oluştu.");
    }
  });
}

/** Son etkinlikleri yükle */
async function loadRecentActivities() {
  const recentActivitiesList = document.getElementById('recentActivitiesList');
  if (!recentActivitiesList) return;

  try {
    const activities = await apiGetPlayingMatches();
    if (activities.data && activities.data.length > 0) {
      recentActivitiesList.innerHTML = activities.data.map(activity => {
        return `<li class="list-group-item recent-activity-item ongoing">
                    <i class="bi bi-controller icon"></i>
                    ${activity.player1} vs ${activity.player2}
                    <span class="badge">${new Date(activity.timestamp).toLocaleString()}</span>
                    <button class="btn btn-primary btn-sm float-end" onclick="joinGame('${activity.detail_url}')">İzle</button>
                </li>`;
      }).join('');
    } else {
      recentActivitiesList.innerHTML = '<li class="list-group-item bg-dark text-white">Henüz etkinlik yok.</li>';
    }
  } catch (error) {
    console.error('Son etkinlikler yüklenirken hata oluştu:', error);
    showErrorMessage("Son etkinlikler yüklenirken bir hata oluştu.");
  }
}

/** Tek tıklamayla maçı izlemek için global fonksiyon (HTML içindeki onclick="joinGame(...)") */
window.joinGame = function (url) {
  setState('detail_url', url);
  history.pushState(null, null, '/GamePage');
  router();
};

/* --------------------------------------------------------------------------
   3) updateProfileUI
   Profil bilgilerini (user objesini) sayfadaki elementlere yazar.
   -------------------------------------------------------------------------- */
export function updateProfileUI(user) {
  const userData = user.data;
  if (!userData || typeof userData !== 'object') {
    console.error("Beklenen formatta user datası yok:", user);
    return;
  }

  document.getElementById('profileNameDisplay').textContent =
    `${userData.first_name} ${userData.last_name}`;
  document.getElementById('profileTitleDisplay').textContent =
    userData.title || 'Ayarlanmamış';
  document.getElementById('profileLocationDisplay').textContent =
    userData.location || 'Ayarlanmamış';

  const avatarUrl = userData.avatar || 'img/default-avatar.png';
  const profileImg = document.getElementById('profileImageDisplay');
  if (profileImg) profileImg.src = avatarUrl;
  const smallPhoto = document.getElementById('profileSmallPhoto');
  if (smallPhoto) smallPhoto.src = avatarUrl;
}

/* --------------------------------------------------------------------------
   4) Yardımcı Fonksiyonlar (Toast, Notification, Debounce vs.)
   -------------------------------------------------------------------------- */

/** Bildirimleri güncelleme */
function updateNotifications(notifications) {
  const notificationBadge = document.getElementById('notificationBadge');
  const requestsMenu = document.getElementById('requestsMenu');

  if (notificationBadge && notifications.total > 0) {
    notificationBadge.textContent = notifications.total;
    notificationBadge.style.display = 'inline';
  } else if (notificationBadge) {
    notificationBadge.style.display = 'none';
  }

  if (requestsMenu) {
    const badge = requestsMenu.querySelector('.badge');
    if (badge) {
      if (notifications.requests > 0) {
        badge.textContent = notifications.requests;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }
}

/** Hata Mesajı Ekrana Basma */
function showErrorMessage(message) {
  showToast(message, 'danger');
}

/** Bootstrap Toast oluşturma */
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 position-fixed top-0 start-50 translate-middle-x mt-3`;
  toast.role = 'alert';
  toast.ariaLive = 'assertive';
  toast.ariaAtomic = 'true';
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 2000 });
  bsToast.show();

  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}

/** Basit debounce fonksiyonu */
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

/* --------------------------------------------------------------------------
   5) cleanupProfile (Opsiyonel)
   Sayfadan ayrılırken (başka rotaya geçerken) event listener'ları kaldırmak
   vb. işlemleri yapmak istersen burada yapabilirsin.
   -------------------------------------------------------------------------- */
function cleanupProfile() {
  // Örnek: friendSearchInput.removeEventListener('input', ...);
  // Modal kapatma, setInterval temizleme, vb.
  // Bu fonksiyonu app.js içinde bir rota değişimi esnasında çağırabilirsin.
  console.log("Profile cleanup yapıldı (örnek).");
}

/** Aktif turnuvaları akordiyon olarak göster */
async function setupActiveTournamentsAccordion() {
  const accordion = document.getElementById('activeTournamentsAccordion');
  if (!accordion) return;
  const currentUser = localStorage.getItem('username') || null;
  try {
    const data = await apiGetActiveTournaments();
    const tournaments = data.data;

    if (!tournaments || tournaments.length === 0) {
      accordion.innerHTML = '<div class="p-3 text-center">Şu anda aktif turnuva bulunmuyor.</div>';
      return;
    }

    accordion.innerHTML = tournaments.map((tournament, index) => `
            <div class="accordion-item bg-transparent" data-tournament-id="${tournament.tournament_id}">
                <h4 class="accordion-header">
                    <button class="accordion-button ${index === 0 ? '' : 'collapsed'} bg-dark text-white" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#tournament${index}">
                        <i class="bi bi-trophy-fill me-2"></i>
                        ${tournament.name}
                        <span class="badge bg-primary ms-2">${tournament.player_count} Oyuncu</span> 
                    </button>
                </h4>
                <div id="tournament${index}" 
                     class="accordion-collapse collapse ${index === 0 ? 'show' : ''}"
                     data-bs-parent="#activeTournamentsAccordion">
                    <div class="accordion-body bg-dark text-white">
                        <div class="row">
                            <div class="col-md-6">
                                <p><i class="bi bi-calendar-event"></i> Başlangıç: ${new Date(tournament.start_date).toLocaleDateString()}</p>
                                <p><i class="bi bi-calendar-check"></i> Bitiş: ${new Date(tournament.end_date).toLocaleDateString()}</p>
                            </div>
                            <div class="col-md-6">
                                <p><i class="bi bi-person-circle"></i> Oluşturan: ${tournament.creator}</p>
                                <p><i class="bi bi-people-fill"></i> Katılımcılar: ${tournament.player1}/${tournament.player2}</p>
                            </div>
                            <div class="col-12">
                            </div>
                        </div>
                        <div class="mt-3 text-center">
                            ${tournament.current_players < tournament.player_count
        ? `<button class="btn btn-primary join-tournament" data-tournament-id="${tournament.tournament_id}">
                                    <i class="bi bi-door-open"></i> Turnuvaya Katıl
                                 </button>`
        : currentUser != tournament.creator ? '<span class="badge bg-secondary">Turnuva Dolu</span>' : `<button class="btn btn-success start-tournament" data-tournament-id="${tournament.tournament_id}">
                                    Turnuvayi Baslat
                                 </button>` }
                        </div>
                        <div class="tournament-bracket-container">
                            <div class="bracket-loading d-none">Yükleniyor...</div>
                            <div class="tournament-bracket">
                                <div class="bracket-rounds"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

    // Katılma butonları için event listener'lar
    accordion.querySelectorAll('.join-tournament').forEach(button => {
      button.addEventListener('click', async (e) => {
        const tournamentId = e.target.dataset.tournamentId;
        try {
          // TODO: Backend'de tournament/join endpoint'i implement edilince eklenecek
          await apiJoinTournament(tournamentId);
          showToast('Turnuvaya katılma isteğiniz alındı!', 'success');
          // Akordiyon içeriğini yenile
          await setupActiveTournamentsAccordion();
        } catch (error) {
          console.error('Turnuvaya katılırken hata:', error);
          showToast('Turnuvaya katılırken bir hata oluştu', 'danger');
        }
      });
    });

    accordion.querySelectorAll('.start-tournament').forEach(button => {
      button.addEventListener('click', async (e) => {
        const tournamentId = e.target.dataset.tournamentId;
        try {
          // TODO: Backend'de tournament/join endpoint'i implement edilince eklenecek
          await apiStartTournament(tournamentId);
          showToast('Turnuvaya katılma isteğiniz alındı!', 'success');
          // Akordiyon içeriğini yenile
        } catch (error) {
          console.error('Turnuvaya katılırken hata:', error);
          showToast('Turnuvaya katılırken bir hata oluştu', 'danger');
        }
      });
    });

  
  } catch (error) {
    console.error('Aktif turnuvalar yüklenirken hata:', error);
    accordion.innerHTML = `
            <div class="alert alert-danger m-3" role="alert">
                <i class="bi bi-exclamation-triangle"></i> Turnuvalar yüklenirken bir hata oluştu.
            </div>
        `;
  }
}
