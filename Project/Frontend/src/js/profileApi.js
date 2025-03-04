// profileApi.js
import { setupActiveTournamentsAccordion } from "/js/profileController.js";

// API taban URL ve accessToken gibi temel değişkenler
const host = window.location.host;
const apiBaseUrl = `https://${host}/api`;
const accessToken = localStorage.getItem("accessToken") || "";

/**
 * Kullanıcı profil bilgilerini getiren fonksiyon
 * @param {string} username 
 * @returns {Promise<Object>}
 */
export async function apiGetUser(username) {
  const response = await fetch(`${apiBaseUrl}/user/getuserprofile/${username}/`, {
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

/**
 * Kullanıcı profilini güncellemek için POST istek
 * FormData ile gönderim yapıldığı için headers otomatik ayarlanır.
 * @param {FormData} formData 
 * @returns {Promise<Object>}
 */
export async function apiUpdateUserProfile(formData) {
  const response = await fetch(`${apiBaseUrl}/user/update_profile/`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });
  return response.json();
}

/**
 * Kullanıcı arama (arkadaş ekleme vb.)
 * @param {string} searchValue 
 * @returns {Promise<Object>}
 */
export async function apiSearchUser(searchValue) {
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
    throw new Error('Yetkilendirme hatası');
  }
  return response.json();
}

/**
 * Arkadaşlık isteği gönderme
 * @param {string} username - Gönderen kullanıcının username'i
 * @param {string} friendUsername - Eklenmek istenen kişinin username'i
 * @returns {Promise<Object>}
 */
export async function apiSendFriendRequest(username, friendUsername) { //bildirimgönderme
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

/**
 * Gelen arkadaşlık isteklerini listeleme
 * @param {string} username 
 * @returns {Promise<Object>}
 */
export async function apiListFriendRequests(username) {
  const response = await fetch(`${apiBaseUrl}/friend/list_friend_requests/${username}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  // if (response.status === 404) {
  //   return { notFound: true };
  // }
  if (!response.ok) {
    throw new Error(`Arkadaşlık istekleri listelenirken hata: ${response.status}`);
  }
  return response.json();
}

/**
 * Arkadaşlık isteğini kabul etme
 * @param {string} username 
 * @param {string} friendname 
 * @returns {Promise<Object>}
 */
export async function apiAcceptFriendRequest(username, friendname) { //bildirimgönderme
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


export async function apiRemoveFriend(userToLoad, friendUsername) {
  const response = await fetch(`${apiBaseUrl}/friend/remove_friend/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ username: userToLoad, friendname: friendUsername })
  });
  if (!response.ok) {
    throw new Error(`Arkadaşı silerken hata: ${response.status}`);
  }
  return response.json();
}
/**
 * Kullanıcının arkadaş listesini getirme
 * @param {string} username 
 * @returns {Promise<Object>}
 */
export async function apiListFriends(username) {
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

/**
 * Aktif turnuvaları getirme
 * @returns {Promise<Object>}
 */
export async function apiGetActiveTournaments() {
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



export async function apiCreateTournament(tournamentData) {
  const response = await fetch(`${apiBaseUrl}/game/create-tournament/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(tournamentData)
  });
  if (!response.ok) {
    throw new Error(`Turnuva oluşturulurken hata: ${response.status}`);
  }
  setupActiveTournamentsAccordion();
  return response.json();
}

/**
 * Rastgele maç isteği atma
 * @returns {Promise<Object>}
 */
export async function apiRandomMatch() {
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

/**
 * Bota (Yapay Zeka) karşı maç isteği atma
 * @returns {Promise<Object>}
 */
export async function apiBotMatch() {
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

/**
 * Şu an oynanan maçları (recent activities) çekme
 * @returns {Promise<Object>}
 */
export async function apiGetPlayingMatches() {
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

export async function apiGetPastGames(userToLoad) {
  const response = await fetch(`${apiBaseUrl}/game/player-status/${userToLoad}/`, {
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

/**
 * Oturumdan çıkış yapma (sign out)
 * @returns {Promise<Response>} - response.ok ya da hata
 */
export async function apiSignOut() {
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

/**
 * Turnuvaya katılma
 * @param {number} tournamentId 
 * @returns {Promise<Object>}
 */
export async function apiJoinTournament(tournamentId) {
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
  return response.json();
}

/**
 * Turnuvayı başlatma
 * @param {number} tournamentId 
 */
export async function apiStartTournament(tournamentId) {
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
  // API yanıt dönmüyor veya başarılı bir sonuca dair response.json() gerekmiyor ise
  // bu alan boş kalabilir ya da gerekirse await response.json(); eklenebilir.
}


export async function apiGetTournamentsMatch(tournamentId)
{
  const response = await fetch(`${apiBaseUrl}/game/tournament/${tournamentId}/playing/`, {
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


export async function apiLocalMatch()
{
  const response = await fetch(`${apiBaseUrl}/game/local-match/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ player1: localStorage.getItem('username') })
  });
  if (!response.ok) {
    throw new Error(`Local match başlatılırken hata: ${response.status}`);
  }
  return response.json();
}


