/**
 * profile.js
 *
 * Kullanıcı profil sayfası ile ilgili tüm işlemleri burada topluyoruz:
 * - Profil yükleme ve düzenleme
 * - Arkadaş arama ve ekleme
 * - Gelen arkadaşlık isteklerini listeleme ve kabul etme
 * - Arkadaş listesini görüntüleme (ve isterseniz kaldırma)
 * - Oyun seçenekleri, çıkış yapma vb.
 */

import { router } from "./app.js";

/* ======================[*] Profil Sayfasını Başlatma Fonksiyonu [*]====================== */
export function initProfile(params = {}) {
  try {

    const navbarUsername = localStorage.getItem('username');

    // Navbar'daki Home linkinin href özelliğini username olarak ayarla
    const homeLink = document.querySelector('.nav-link.active');
    if (homeLink) {
      homeLink.href = navbarUsername;
    }

    /* ---------------- 1) Kullanıcı Bilgisi & API Hazırlığı ---------------- */
    const routeUser = params.username || null;  // Rota parametresinde gelen kullanıcı adı
    const currentUser = localStorage.getItem('username') || null; // Giriş yapmış kullanıcı
    const userToLoad = routeUser || currentUser; // Hangi profil görüntülenecek

    if (!userToLoad) {
      console.error('No username found to load profile.');
      return;
    }
    // Kendi profilim mi?
    const isOwnProfile = (userToLoad === currentUser);

    // API Temel Bilgiler
    const host = window.location.host;
    const apiBaseUrl = `https://${host}/api`;
    const accessToken = localStorage.getItem("accessToken");

    // console.log('Profil sayfası başlatılıyor:', { userToLoad, isOwnProfile });

    /* ---------------- 2) Kullanıcı Bilgilerini Çek ---------------- */
    fetch(`${apiBaseUrl}/user/getuser/${userToLoad}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'tr',
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Kullanıcı bilgisi çekilirken hata: ${response.status}`);
        }
        return response.json();
      })
      .then(user => {
        // user -> { data: {...} }
        updateProfileUI(user);

        // Başkasının profiliyse düzenleme aksiyonlarını/btn'leri gizleyin
        if (!isOwnProfile) {
          const profileActions = document.getElementById('profileActions');
          if (profileActions) {
            profileActions.style.display = 'none';
          }
        }
      })
      .catch(error => {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        showErrorMessage("Kullanıcı bilgileri yüklenirken bir hata oluştu.");
      });

    /* ---------------- 3) Profil Düzenleme İşlemleri (Settings) ---------------- */
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      if (!isOwnProfile) {
        // Başkasının profilinde formu gizle
        settingsForm.style.display = 'none';
      } else {
        // Kendi profilimiz: Submit işlemi
        settingsForm.addEventListener('submit', function (e) {
          e.preventDefault();
          const formData = new FormData(this);

          fetch(`${apiBaseUrl}/user/update_profile/`, {
            method: 'POST',
            headers: {
              // multipart/form-data olduğundan Content-Type otomatik atanır
              'Accept': 'application/json',
              'Accept-Language': 'tr',
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                // console.log('Profil başarıyla güncellendi!');
                // Gerekirse tekrar profil bilgisi çek: 
                // or data içinde güncel user varsa updateProfileUI(data);
                
                updateProfileUI(data);
              } else {
                console.log('Profil güncellenemedi: ' + (data.message || 'Bilinmeyen hata.'));
              }
            })
            .catch(err => {
              console.error('Profil güncellerken hata:', err);
              showErrorMessage("Profil güncellenirken bir hata oluştu.");
            });
        });
      }
    }

    /* ---------------- 4) Arkadaş Arama & Ekleme ---------------- */
    const friendSearchInput = document.getElementById('friendSearchInput');
    if (friendSearchInput) {
      friendSearchInput.addEventListener('input', debounce(handleFriendSearch, 500));
    }

    function handleFriendSearch() {
      const searchValue = friendSearchInput.value.trim();
      const suggestionsList = document.getElementById('friendSuggestions');
      if (!suggestionsList) return;

      if (searchValue.length >= 3) {
        suggestionsList.innerHTML = '<li class="list-group-item">Yükleniyor...</li>';
        suggestionsList.style.display = 'block';

        fetch(`${apiBaseUrl}/user/getuser/${searchValue}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'tr',
            'Authorization': `Bearer ${accessToken}`
          }
        })
          .then(response => {
            if (response.status === 401) {
              history.pushState(null, null, '/');
              router();
              throw new Error('Yetkilendirme hatası');
            }
            return response.json();
          })
          .then(result => {
            suggestionsList.innerHTML = '';
            // result.data -> array veya object olabilir
            if (Array.isArray(result.data) && result.data.length > 0) {
              result.data.forEach(u => createSuggestionItem(u, suggestionsList));
            } else if (result.data && typeof result.data === 'object') {
              createSuggestionItem(result.data, suggestionsList);
            } else {
              suggestionsList.innerHTML = '<li class="list-group-item">Sonuç bulunamadı.</li>';
            }
          })
          .catch(error => {
            console.error('Arkadaş aramada hata:', error);
            suggestionsList.innerHTML = '<li class="list-group-item text-danger">Arama sırasında hata oluştu.</li>';
          });
      } else {
        suggestionsList.innerHTML = '';
        suggestionsList.style.display = 'none';
      }
    }

    function createSuggestionItem(userObj, suggestionsList) {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

      // Kullanıcı adına tıklayarak profil sayfasına gidebilirsiniz
      const userNameLink = document.createElement('a');
      userNameLink.href = `/${userObj.username}`; // Rotanız /:username ise
      userNameLink.textContent = `${userObj.first_name} ${userObj.last_name}`;
      userNameLink.className = 'text-decoration-none text-white';

      // SPA yönlendirme
      userNameLink.addEventListener('click', function (e) {
        e.preventDefault();
        history.pushState(null, null, this.href);
        router()  // Eğer router globalde tanımlıysa, çağırın
      });

      listItem.appendChild(userNameLink);

      // Arkadaş ekleme butonu
      const addButton = document.createElement('button');
      addButton.className = 'btn btn-primary btn-sm';
      addButton.textContent = 'Arkadaş Ekle';

      if (currentUser && userObj.username) {
        // console.log("Kullanıcı adı:", currentUser);
        addButton.onclick = () => sendFriendRequest(currentUser, userObj.username, apiBaseUrl, accessToken);
      }
      else {
        addButton.onclick = () => alert("Arkadaş eklemek için giriş yapmalısınız.");
      }

      listItem.appendChild(addButton);
      suggestionsList.appendChild(listItem);
    }

    // Debounce fonksiyonu (API'yi gereksiz zorlamamak için)
    function debounce(func, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
      };
    }

    /* ---------------- 5) Gelen Arkadaş İsteklerini Listele & Kabul Et ---------------- */
    const showRequestsBtn = document.getElementById('showRequestsButton');
    if (showRequestsBtn) {
      showRequestsBtn.addEventListener('click', () => {
        showFriendRequestsSection(userToLoad, apiBaseUrl, accessToken);
      });
    }

    /* ---------------- 6) Arkadaşlar Listesini Göster & Kaldır ---------------- */
    const showFriendsBtn = document.getElementById('viewFriendsButton');
    if (showFriendsBtn) {
      showFriendsBtn.addEventListener('click', () => {
        showFriendsSection(userToLoad, currentUser, apiBaseUrl, accessToken);
      });
    }

    /* ---------------- 7) Oyun Seçenekleri & Diğer İşlemler ---------------- */
    const gameOptionButtons = document.querySelectorAll('.game-option-button');
    gameOptionButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const selectedCard = this.closest('.game-option-card');
        const optionId = selectedCard.getAttribute('data-option');
        const optionTitle = selectedCard.querySelector('h3').textContent;

        document.getElementById('gameOptionsModalLabel').textContent = `${optionTitle} Seçenekleri`;
        const optionContent = document
          .getElementById('hiddenOptions')
          .querySelector(`#${optionId}`)
          .cloneNode(true);

        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = '';
        modalContent.appendChild(optionContent);

        const modal = new bootstrap.Modal(document.getElementById('gameOptionsModal'));
        modal.show();
      });
    });

    /* ---------------- 8) Çıkış Yapma ---------------- */
    const signOutLink = document.querySelector('.dropdown-menu a[href="#signout"]');
    if (signOutLink) {
      signOutLink.addEventListener('click', function () {
        fetch(`${apiBaseUrl}/auth/singout/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'tr',
            'Authorization': `Bearer ${accessToken}`
          }
        })
          .then(response => {
            if (response.ok) {
              localStorage.clear();
              history.pushState(null, null, '/');
              router();
            } else {
              throw new Error('Çıkış yaparken hata oluştu.');
            }
          })
          .catch(error => {
            console.error('Çıkış yaparken hata oluştu:', error);
            showErrorMessage("Çıkış yaparken bir hata oluştu.");
          });
      });
    }


  } catch (error) {
    console.error('initProfile hata:', error);
    showErrorMessage("Profil yüklenirken bir hata oluştu.");
  }
}

// /* ======================[*] Son Etkinlikleri Yükleme [*]====================== */
// const recentActivitiesList = document.getElementById('recentActivitiesList');
// fetch(`${apiBaseUrl}/user/recent-activities/${username}`, { // bura henüz çalışmıyor
//     method: 'GET',
//     headers: {
//         'Accept': 'application/json',
//         'Accept-Language': 'tr',
//         'Authorization': `Bearer ${accessToken}`
//     }
// })
// .then(response => response.json())
// .then(activities => {
//     if (recentActivitiesList) {
//         recentActivitiesList.innerHTML = activities.length > 0
//             ? activities.map(activity => {
//                 const isPlaying = activity.status === 'playing';
//                 return `<li class="list-group-item bg-dark text-white">
//                             ${activity.description}
//                             ${isPlaying ? `<button class="btn btn-primary btn-sm float-end" onclick="joinGame('${activity.gameId}')">İzle</button>` : ''}
//                         </li>`;
//             }).join('')
//             : '<li class="list-group-item bg-dark text-white">Henüz etkinlik yok.</li>';
//     }
// })
// .catch(error => {
//     console.error('Son etkinlikler yüklenirken hata oluştu:', error);
//     showErrorMessage("Son etkinlikler yüklenirken bir hata oluştu.");
// });

/* ======================[*] Profili Güncelleme UI [*]====================== */
export function updateProfileUI(user) {
  const userData = user.data;
  if (!userData) {
    console.error("Beklenen formatta user datası yok:", user);
    return;
  }

  // DOM'a bilgileri yerleştirin
  document.getElementById('profileNameDisplay').textContent = `${userData.first_name} ${userData.last_name}`;
  document.getElementById('profileTitleDisplay').textContent = userData.title || 'Ayarlanmamış';
  document.getElementById('profileLocationDisplay').textContent = userData.location || 'Ayarlanmamış';

  const avatarUrl = userData.avatar || 'img/default-avatar.png';
  document.getElementById('profileImageDisplay').src = avatarUrl;
  document.getElementById('profileSmallPhoto').src = avatarUrl;
}

/* ======================[*] Arkadaşlık İsteği Gönderme [*]====================== */
function sendFriendRequest(username, friendUsername, apiBaseUrl, accessToken) {
  fetch(`${apiBaseUrl}/friend/send_friend_request/`, {
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
  })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
      if (status !== 200) {
        throw new Error(body.message || `Arkadaşlık isteği gönderilirken hata: ${status}`);
      }
      notifyFriendRequestSent(friendUsername);
    })
    .catch(error => {
      displayFriendRequestError(error.message);
    });

  function notifyFriendRequestSent(friendUsername) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success';
    notification.textContent = `Arkadaşlık isteği gönderildi: ${friendUsername}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  function displayFriendRequestError(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-danger';
    notification.textContent = `Arkadaşlık isteği gönderilemedi: ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}


    /* ======================[*] Gelen İstekleri Listele & Kabul Et [*]====================== */
    function showFriendRequestsSection(username, apiBaseUrl, accessToken) {
      const friendRequestsContainer = document.getElementById('friendRequestsContainer');
      if (!friendRequestsContainer) return;


      // 1) İstekleri çek
      fetch(`${apiBaseUrl}/friend/list_friend_requests/${username}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': 'tr',
          'Authorization': `Bearer ${accessToken}`
        }
      })
        .then(res => {
          if (res.status === 404)
            return { notFound: true };
          if (!res.ok) {
            throw new Error(`Arkadaşlık istekleri listelenirken hata: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          // console.log('Gelen istekler:', data);
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

          // Kabul Et butonları
          const acceptButtons = friendRequestsContainer.querySelectorAll('button[data-friend]');
          acceptButtons.forEach(btn => {
            btn.addEventListener('click', () => {
              const friendname = btn.getAttribute('data-friend');
              // console.log('İstek friendname:', friendname);
              acceptFriendRequest(username, friendname, apiBaseUrl, accessToken)
                .then(result => {
                  // console.log('İstek kabul sonucu:', result);
                  if (result.success) {
                    notifyFriendRequestAccepted(); // 
                    // İstek kabul edildiyse DOM'dan kaldır
                    btn.parentElement.remove();
                  } else {
                    notifyRequestAcceptanceFailure();//
                  }

                  function notifyRequestAcceptanceFailure() {
                    // Bildirim gösterme örneği
                    const notification = document.createElement('div');
                    notification.className = 'alert alert-danger';
                    notification.textContent = `Arkadaşlık isteği kabul edilemedi: ${result.message || 'Bilinmeyen hata'}`;
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }

                  function notifyFriendRequestAccepted() {
                    // Bildirim gösterme örneği
                    const notification = document.createElement('div');
                    notification.className = 'alert alert-success';
                    notification.textContent = `${friendname} arkadaşlık isteğinizi kabul etti.`;
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }
                })
                .catch(err => console.error('İstek kabul hatası:', err));
            });
          });
        })
        .catch(err => {
          console.error('listFriendRequests hata:', err);
          friendRequestsContainer.innerHTML = `<p class="text-danger">Arkadaşlık istekleri yüklenirken hata oluştu.</p>`;
        });
    }

    function acceptFriendRequest(username, friendname, apiBaseUrl, accessToken) {
      return fetch(`${apiBaseUrl}/friend/accept_friend_request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': 'tr',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ username, friendname })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Arkadaşlık isteği kabul edilirken hata: ${res.status}`);
          }
          return res.json();
        });
    }

/* ======================[*] Arkadaş Listesini Göster & Kaldır [*]====================== */
function showFriendsSection(userToLoad, currentUser, apiBaseUrl, accessToken) {
  const friendsContainer = document.getElementById('friendsList'); // ID güncellendi
  if (!friendsContainer) return;

  fetch(`${apiBaseUrl}/friend/friends/${userToLoad}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'tr',
      'Authorization': `Bearer ${accessToken}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Arkadaş listesi alınırken hata: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      // console.log('Arkadaşlar:', data);
      const friendsArr = data.data || [];
      if (friendsArr.length === 0) {
        friendsContainer.innerHTML = `<p>Henüz arkadaş bulunmuyor.</p>`;
        return;
      }

      let html = '<ul class="list-group">';
      friendsArr.forEach(friendObj => {
        // console.log('Arkadaş:', friendObj);
        const friendUsername = friendObj.friendname;
        // Eğer kendi profilimizse "Kaldır" butonu gösterelim
        const showRemove = (userToLoad === currentUser);

        html += `
          <li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
            <span>${friendUsername}</span>
            ${showRemove ? `
              <button class="btn btn-sm btn-danger" data-friend="${friendUsername}">
                Kaldır
              </button>` : ''}
          </li>`;
      });
      html += '</ul>';

      friendsContainer.innerHTML = html;

      // "Kaldır" butonları (sadece kendi profilimizde)
      // if (userToLoad === currentUser) {
      //   const removeButtons = friendsContainer.querySelectorAll('button[data-friend]');
      //   removeButtons.forEach(btn => {
      //     btn.addEventListener('click', () => {
      //       const friendName = btn.getAttribute('data-friend');
      //       removeFriend(userToLoad, friendName, apiBaseUrl, accessToken)
      //         .then(res => {
      //           if (res.success) {
      //             alert('Arkadaş kaldırıldı.');
      //             btn.parentElement.remove();
      //           } else {
      //             alert('Arkadaş kaldırılamadı: ' + (res.message || 'Bilinmeyen hata.'));
      //           }
      //         })
      //         .catch(err => console.error('Arkadaş kaldırma hatası:', err));
      //     });
      //   });
      // }
    })
    .catch(err => {
      console.error('listFriends hata:', err);
      friendsContainer.innerHTML = `<p class="text-danger">Arkadaş listesi yüklenirken hata oluştu.</p>`;
    });
}
/**
 * Kaldırma örneği (varsayımsal / friend_remove endpoint)
 * Projenizde yoksa bu fonksiyonu kaldırabilirsiniz.
 */
// function removeFriend(username, friendname, apiBaseUrl, accessToken) {
//   return fetch(`${apiBaseUrl}/friend/remove_friend/`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json',
//       'Accept-Language': 'tr',
//       'Authorization': `Bearer ${accessToken}`
//     },
//     body: JSON.stringify({ username, friendname })
//   })
//     .then(res => res.json());
// }

/* ======================[*] Hata Mesajı Gösterme Fonksiyonu [*]====================== */
function showErrorMessage(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message alert alert-danger";
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

/* ======================[*] Router SPA Kullanıyorsanız Bu Satırı Yoruma Alın [*]====================== */
// document.addEventListener('DOMContentLoaded', initProfile);
