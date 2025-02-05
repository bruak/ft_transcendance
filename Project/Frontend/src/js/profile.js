/* ======================[*] BUDUR SONN Profil Sayfasını Başlatma Fonksiyonu [*]====================== */
import { router } from './app.js';

export function initProfile(params = {}) {
    try {
      // 1) Rota parametresi ile giriş yapmış kullanıcı adı
      const routeUser = params.username || null; 
      const currentUser = localStorage.getItem('username') || null;
      
      // 2) Hangi kullanıcı profilini görüntüleyeceğiz?
      //    Eğer rota parametresi varsa, o kullanıcıyı yükler.
      //    Yoksa "kendi" profilini (currentUser) yükleyebilirsiniz.
      //    Proje mantığınıza göre bu kısım değişebilir.
      const userToLoad = routeUser || currentUser; 
      if (!userToLoad) {
        // Kullanıcı adı yoksa, belki anasayfaya dönmek istersiniz:
        console.error('No username found to load profile.');
        return;
      }
  
      // 3) Kendi profilim mi, başkasının profili mi?
      const isOwnProfile = (userToLoad === currentUser);
  
      // 4) URL ve Token
      const host = window.location.host;
      const apiBaseUrl = `https://${host}/api`;
      const accessToken = localStorage.getItem("accessToken");
  
      console.log('Profil sayfası başlatılıyor:', { userToLoad, isOwnProfile });
  
      /* =============== Kullanıcı Bilgilerini API'den Çekme =============== */
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
        // Örneğin API "user.data" formatında veri döndürüyor olabilir
        updateProfileUI(user);  // user -> { data: {...} } 
        
        if (!isOwnProfile) {
          // Örneğin düzenleme butonlarını gizleyin
          const profileActions = document.getElementById('profileActions');
          if (profileActions) {
            profileActions.style.display = 'none';
          }
        }
      })
      .catch(error => {
        console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', error);
        showErrorMessage("Kullanıcı bilgileri yüklenirken bir hata oluştu.");
      });
  
      /* =============== Profil Düzenleme Formu İşleme =============== */
      const editProfileForm = document.getElementById('editProfileForm');
      if (editProfileForm) {
        if (!isOwnProfile) {
          // Başkasının profilinde düzenleme formunu gösterme
          editProfileForm.style.display = 'none';
        } else {
          // Kendi profilimiz
          editProfileForm.addEventListener('submit', function (event) {
            event.preventDefault();
            // Örnek form işleme (FormData vs.)
            const formData = new FormData(this);
  
            // Örnek: Avatar, isim, vs. yakalayabilirsiniz
            // const newAvatarFile = document.getElementById('profileImage').files[0];
            // if (newAvatarFile) formData.append('avatar', newAvatarFile);
  
            fetch(`${apiBaseUrl}/auth/singup/`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Accept-Language': 'tr',
                'Authorization': `Bearer ${accessToken}`
                // Content-Type ayarı FormData kullandığınızda otomatik atanır.
              },
              body: formData
            })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                alert('Profil başarıyla güncellendi!');
                // Profil yeniden yüklensin isterseniz tekrar fetch atabilirsiniz:
                // Or data içinde güncellenmiş user varsa updateProfileUI(data);
              } else {
                alert('Profil güncellenemedi: ' + (data.message || 'Bilinmeyen hata.'));
              }
            })
            .catch(err => {
              console.error('Profil güncellerken hata:', err);
              showGlobalError("Profil güncellenirken bir hata oluştu.");
            });
          });
        }
      }
    /* ======================[*] Arkadaş Arama İşlemi [*]====================== */
    const friendSearchInput = document.getElementById('friendSearchInput');

    if (friendSearchInput) {
        friendSearchInput.addEventListener('input', debounce(handleFriendSearch, 300));
    }

    function handleFriendSearch() {
        const searchInput = friendSearchInput.value.trim();
        const suggestionsList = document.getElementById('friendSuggestions');

        if (searchInput.length >= 3) {
            console.log('Arkadaş arama sorgusu:', searchInput);

            // "Yükleniyor..." göstergesi
            suggestionsList.innerHTML = '<li class="list-group-item">Yükleniyor...</li>';
            suggestionsList.style.display = 'block';

            fetch(`${apiBaseUrl}/user/getuser/${searchInput}`, {
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
                        window.location.href = '/login';  // Yetkilendirme hatasında giriş sayfasına yönlendir
                        throw new Error('Yetkilendirme hatası');
                    }
                    return response.json();
                })
                .then(result => {
                    console.log('Arama sonuçları:', result);
                    suggestionsList.innerHTML = '';
                     // result = { data: [ {...}, {...} ] } veya { data: {...} }
                    if (Array.isArray(result.data) && result.data.length > 0) {
                        result.data.forEach(user => createSuggestionItem(user, suggestionsList));
                    } else if (result.data && typeof result.data === 'object') {
                        createSuggestionItem(result.data, suggestionsList);
                    } else {
                        suggestionsList.innerHTML = '<li class="list-group-item">Sonuç bulunamadı.</li>';
                    }
                })
                .catch(error => {
                    console.error('Arkadaşlar aranırken hata oluştu:', error);
                    suggestionsList.innerHTML = '<li class="list-group-item text-danger">Arama sırasında bir hata oluştu.</li>';
                });

        } else {
            console.log('Arama sorgusu çok kısa.');
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
        }
    }

    

    function createSuggestionItem(user, suggestionsList) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    
        // Kullanıcı adını tıklanabilir yap
        const userNameLink = document.createElement('a');
        userNameLink.href = `/${user.username}`;
        userNameLink.textContent = `${user.first_name} ${user.last_name}`;
        userNameLink.className = 'text-decoration-none text-dark';
        
        // Tıklama olayını yakala ve SPA davranışı ekle
        userNameLink.addEventListener('click', function(e) {
            e.preventDefault();
            history.pushState(null, null, this.href);
            if (typeof router === 'function')
                router(); // Router'ı tetikle
        });
    
        listItem.appendChild(userNameLink);
    
        // Arkadaş ekleme butonu
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-primary btn-sm';
        addButton.textContent = 'Arkadaş Ekle';
        addButton.onclick = () => sendFriendRequest(localStorage.getItem("username"), user.username);
    
        listItem.appendChild(addButton);
        suggestionsList.appendChild(listItem);
    }

    // Debounce fonksiyonu: Çok sık API çağrısı yapılmasını önler
    function debounce(func, delay) {
        let debounceTimer;
        return function (...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Hata mesajlarını göstermek için yardımcı fonksiyon
    function showErrorMessage(message) {
        const suggestionsList = document.getElementById('friendSuggestions');
        suggestionsList.innerHTML = `<li class="list-group-item text-danger">${message}</li>`;
        suggestionsList.style.display = 'block';
    }

    // Arkadaş ekleme fonksiyonu (bu API'nin çalışma şekline göre uyarlanabilir)
    function sendFriendRequest(fromUser, toUser) {
        fetch(`${apiBaseUrl}/friend/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ fromUser, toUser })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Arkadaşlık isteği gönderildi!');
                } else {
                    alert('Arkadaşlık isteği gönderilemedi.');
                }
            })
            .catch(error => {
                console.error('Arkadaş ekleme sırasında hata:', error);
                alert('Bir hata oluştu, lütfen tekrar deneyin.');
            });
    }


    /* ======================[*] Arkadaşları Görüntüleme [*]====================== */
    const viewFriendsButton = document.getElementById('viewFriendsButton');
    if (viewFriendsButton) {
        viewFriendsButton.addEventListener('click', function () {
            fetch(`${apiBaseUrl}/friend/friends/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Accept-Language': 'tr',
                    'Authorization': `Bearer ${accessToken}`
                }
            })
                .then(response => response.json())
                .then(friends => displayFriendsList(friends))
                .catch(error => {
                    console.error('Arkadaşlar yüklenirken hata oluştu:', error);
                    showErrorMessage("Arkadaşlar yüklenirken bir hata oluştu.");
                });
        });
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

        /* ======================[*] Oyun Seçenekleri Bölümü İşleme [*]====================== */
        const gameOptionButtons = document.querySelectorAll('.game-option-button');
        gameOptionButtons.forEach(button => {
            button.addEventListener('click', function () {
                const selectedCard = this.closest('.game-option-card');
                const optionId = selectedCard.getAttribute('data-option');
                const optionTitle = selectedCard.querySelector('h3').textContent;

                document.getElementById('gameOptionsModalLabel').textContent = `${optionTitle} Seçenekleri`;
                const optionContent = document.getElementById('hiddenOptions').querySelector(`#${optionId}`).cloneNode(true);
                
                const modalContent = document.getElementById('modalContent');
                modalContent.innerHTML = '';
                modalContent.appendChild(optionContent);

                const modal = new bootstrap.Modal(document.getElementById('gameOptionsModal'));
                modal.show();
            });
        });

        /* ======================[*] Çıkış Yapma [*]====================== */
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
                        window.location.href = '/';
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
        console.error('initializeProfile fonksiyonunda hata oluştu:', error);
        showErrorMessage("Profil yüklenirken bir hata oluştu.");
    }
}

/* ======================[*] Arkadaşlık İsteği Gönderme Fonksiyonu [*]====================== */
function sendFriendRequest(username, friendUsername) {
    fetch(`${apiBaseUrl}/friend/send_friend_request/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'tr',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            username: username,
            friend: friendUsername
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Arkadaşlık isteği gönderildi!');
        } else {
            alert('Arkadaşlık isteği gönderilemedi.');
        }
    })
    .catch(error => {
        console.error('Arkadaşlık isteği gönderilirken hata oluştu:', error);
        showErrorMessage("Arkadaşlık isteği gönderilirken bir hata oluştu.");
    });
}

/* ======================[*] Arkadaş Listesini Gösterme [*]====================== */
function displayFriendsList(friends) {
    const friendsList = document.getElementById('friendsList');
    if (friendsList) {
        friendsList.innerHTML = friends.length > 0
            ? friends.map(friend => `<li class="list-group-item">${friend.username}</li>`).join('')
            : '<li class="list-group-item">Henüz arkadaşınız yok.</li>';
    }
}

/* ======================[*] Profil Bilgilerini Güncelleme [*]====================== */
// updateProfileUI fonksiyonu
export function updateProfileUI(user) {
    // Eğer user = { data: {...} } ise:
    const userData = user.data;
    if (!userData) {
      console.error("Beklenen formatta kullanıcı datası yok.");
      return;
    }
  
    // DOM elementlerini doldurun:
    document.getElementById('profileNameDisplay').textContent = `${userData.first_name} ${userData.last_name}`;
    document.getElementById('profileTitleDisplay').textContent = userData.title || 'Ayarlanmamış';
    document.getElementById('profileLocationDisplay').textContent = userData.location || 'Ayarlanmamış';
    const avatarUrl = userData.avatar || 'img/default-avatar.png';
    document.getElementById('profileImageDisplay').src = avatarUrl;
    document.getElementById('profileSmallPhoto').src = avatarUrl;
  }
/* ======================[*] Oyuna Katılma Fonksiyonu [*]====================== */
function joinGame(gameId) {
    window.location.href = `/game/${gameId}`;
}

/* ======================[*] Hata Mesajı Gösterme Fonksiyonu [*]====================== */
function showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message alert alert-danger";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

/* ======================[*] Sayfa Yüklendiğinde initProfile Fonksiyonunu Çağır [*]====================== */
document.addEventListener('DOMContentLoaded', initProfile);
