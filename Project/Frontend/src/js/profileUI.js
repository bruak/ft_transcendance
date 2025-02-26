// profileUI.js

/**
 * Kullanıcı profili verilerini DOM'a yazan fonksiyon
 * @param {Object} user - Sunucudan dönen kullanıcı verisi (user.data formatında)
 */
export function updateProfileUI(user) {
	const userData = user.data;
	if (!userData || typeof userData !== 'object') {
	  console.error("Beklenen formatta user datası yok:", user);
	  return;
	}
  
	// Profil isim alanları
	const profileNameEl = document.getElementById('profileNameDisplay');
	const profileTitleEl = document.getElementById('profileTitleDisplay');
	const profileLocationEl = document.getElementById('profileLocationDisplay');
  
	if (profileNameEl) {
	  profileNameEl.textContent = `${userData.first_name} ${userData.last_name}`;
	}
	if (profileTitleEl) {
	  profileTitleEl.textContent = userData.title || 'Ayarlanmamış';
	}
	if (profileLocationEl) {
	  profileLocationEl.textContent = userData.location || 'Ayarlanmamış';
	}
  
	// Profil fotoğrafları
	const avatarUrl = userData.avatar || 'img/default-avatar.png';
	const profileImg = document.getElementById('profileImageDisplay');
	const smallPhoto = document.getElementById('profileSmallPhoto');
	if (profileImg) profileImg.src = avatarUrl;
	if (smallPhoto) smallPhoto.src = avatarUrl;
  }
  
  /**
   * Bildirimleri güncelleme (örn. gelen istek sayısı, toplam bildirim vb.)
   * @param {Object} notifications - { total, requests } gibi değerler içerir
   */
  export function updateNotifications(notifications) {
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
  
  /**
   * Hata mesajlarını kullanıcıya göstermek için yardımcı fonksiyon
   * => showToast ile 'danger' tipinde mesaj gösterilir
   * @param {string} message
   */
  export function showErrorMessage(message) {
	showToast(message, 'danger');
  }
  
  /**
   * Bootstrap toast ile mesaj gösterme
   * type: 'success', 'danger', 'warning' vb. olabilir
   * @param {string} message 
   * @param {string} [type='success']
   */
  export function showToast(message, type = 'success') {
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
  
  /**
   * Input alanları gibi yerlerde gereksiz yere 
   * sürekli API istekleri yapılmasını engellemek için kullanılan
   * küçük bir debounce yardımcı fonksiyonudur.
   * @param {Function} func 
   * @param {number} delay 
   * @returns 
   */
  export function debounce(func, delay) {
	let timer;
	return function (...args) {
	  clearTimeout(timer);
	  timer = setTimeout(() => func.apply(this, args), delay);
	};
  }
  
  /* 
  -------------------------------------------------------------------------------
   Aşağıda isteğe bağlı olarak, farklı UI render fonksiyonları da eklenebilir. 
   Örneğin:
	  - Gelen isteklerin listelendiği HTML’i oluşturma (renderFriendRequests)
	  - Arkadaş listesini ekrana basma (renderFriendsList)
	  - Turnuva akordiyonunu oluşturma (renderTournamentsAccordion)
	  - vb.
   
   Bu şekilde DOM yapılarını oluşturmak/güncellemek “UI” dosyasında, 
   eventListener’lar ve iş mantığı “controller” dosyasında saklanabilir.
  -------------------------------------------------------------------------------
  */
  
  /**
   * Örnek: Arkadaşlık isteklerini liste olarak DOM'a basma
   * @param {HTMLElement} container - Arkadaşlık isteklerini basacağımız DOM elementi
   * @param {Array} requests - [{ username: "..."}, ...]
   */
  export function renderFriendRequests(container, requests) {
	if (requests.length === 0) {
	  container.innerHTML = `<p>Gelen arkadaşlık isteği yok.</p>`;
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
	container.innerHTML = html;
  }
  
  /**
   * Örnek: Arkadaşlar listesini DOM'a basma
   * @param {HTMLElement} container 
   * @param {Array} friendsArr - [{ friendname: "..."}...]
   * @param {boolean} canRemove - Kendi profilimiz ise "Kaldır" butonunu göstermek için
   * @param {Function} onRemoveClick - "Kaldır" butonuna tıklandığında çalışacak fonksiyon
   */
  export function renderFriendsList(container, friendsArr, canRemove = false, onRemoveClick = null) {
	if (friendsArr.length === 0) {
	  container.innerHTML = `<p>Henüz arkadaş bulunmuyor.</p>`;
	  return;
	}
	let html = '<ul class="list-group">';
	friendsArr.forEach(friendObj => {
	  const friendUsername = friendObj.friendname;
	  html += `
		<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
		  <span><span class="badge bg-success me-2"><i class="bi bi-person-check"></i></span>${friendUsername}</span>
		  ${
			canRemove 
			  ? `<button class="btn btn-sm btn-danger" data-friend="${friendUsername}">Kaldır</button>` 
			  : ''
		  }
		</li>`;
	});
	html += '</ul>';
	container.innerHTML = html;
  
	// "Kaldır" butonları (isteğe bağlı)
	if (canRemove && onRemoveClick) {
	  const removeButtons = container.querySelectorAll('button[data-friend]');
	  removeButtons.forEach(btn => {
		btn.addEventListener('click', () => {
		  const friendUsername = btn.getAttribute('data-friend');
		  onRemoveClick(friendUsername); // callback
		});
	  });
	}
  }
  
  /**
   * Örnek: Aktif turnuvaları accordion şeklinde gösterme
   * (Bu fonksiyon, sadece HTML oluşturup container'a basar.
   *  Tıklama olayları ve API çağrıları, controller tarafında 
   *  eklenebilir.)
   * @param {HTMLElement} container 
   * @param {Array} tournaments 
   * @param {string} currentUser
   */
  export function renderActiveTournamentsAccordion(container, tournaments, currentUser) {
	if (!tournaments || tournaments.length === 0) {
	  container.innerHTML = '<div class="p-3 text-center">Şu anda aktif turnuva bulunmuyor.</div>';
	  return;
	}

	container.innerHTML = tournaments.map((tournament, index) => `
	  <div class=" akordiyon accordion-item bg-transparent" data-tournament-id="${tournament.tournament_id}">
		<h4 class="accordion-header">
		  <button class="accordion-button collapsed bg-dark text-white" 
				  type="button" 
				  data-bs-toggle="collapse" 
				  data-bs-target="#tournament${index}">
			<i class="bi bi-trophy-fill me-2"></i>
			${tournament.name}
			<span class="badge bg-primary ms-2">${tournament.player_count} Oyuncu</span> 
		  </button>
		</h4>
		<div id="tournament${index}" 
			 class="accordion-collapse collapse"
			 data-bs-parent="#${container.id}">
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
			</div>
			<div class="Base-list"> </div>
			<div class="mt-3 text-center">
			  ${
				tournament.current_players < tournament.player_count
				  ? `<button class="btn btn-primary join-tournament" data-tournament-id="${tournament.tournament_id}">
					   <i class="bi bi-door-open"></i> Turnuvaya Katıl
					 </button>`
				  : (currentUser !== tournament.creator 
					 ? '<span class="badge bg-secondary">Turnuva Dolu</span>' 
					 : `<button class="btn btn-success start-tournament" data-tournament-id="${tournament.tournament_id}">
						  <i class="bi bi-play-fill"></i> Turnuvayı Başlat
						</button>`)
			  }
			</div>
		  </div>
		</div>
	  </div>
	`).join('');
  }
  
  /**
   * Örnek: Son etkinlikler (maçlar) listesini DOM'a basma
   * @param {HTMLElement} container
   * @param {Array} activities
   */
  export function renderRecentActivities(container, activities) {
	if (!activities || activities.length === 0) {
	  container.innerHTML = '<li class="list-group-item bg-dark text-white">Henüz etkinlik yok.</li>';
	  return;
	}
	container.innerHTML = activities.map(activity => {
	  const timeStr = new Date(activity.timestamp).toLocaleString();
	  return `
		<li class="list-group-item recent-activity-item ongoing text-white">
		  <i class="bi bi-controller icon"></i>
		  ${activity.player1} vs ${activity.player2}
		  <span class="badge">${timeStr}</span>
		  <button class="btn btn-primary btn-sm float-end" data-detailurl="${activity.detail_url}">İzle</button>
		</li>`;
	}).join('');
  }
  

  /**
  * Turnuva maçlarını liste olarak DOM'a basan fonksiyon
  * Turnuva içindeki eşleşmeleri ve maça katılım butonlarını gösterir
  * @param {HTMLElement} ListContainer - Turnuva listesinin ekleneceği konteyner element
  * @param {Array} Matches - [{player1: string, player2: string, detail_url: string},...] formatında maç listesi
  */
  export function renderTournamentList(ListContainer, Matches) {
	if (!Matches || Matches.length === 0) {
		ListContainer.innerHTML = '<li class="list-group-item bg-dark text-white">Henüz turnuva bulunmuyor.</li>';
		return;
	}
	ListContainer.innerHTML = Matches.map(match => {
		return `
		<li class="list-group-item tournament-match-item">
			<div class="match-players">
				<i class="bi bi-trophy-fill text-warning me-2"></i>
				<strong>${match.player1}</strong>
				<span class="vs-text mx-2">VS</span>
				<strong>${match.player2}</strong>
			</div>
			<div class="match-actions ms-auto">
				<button class="btn btn-sm btn-success play-match" data-detailurl="${match.detail_url}">
					<i class="bi bi-controller"></i> Maça Git
				</button>
			</div>
		</li>`;
	}).join('');
}


/*
`
        <li class="list-group-item tournament-match-item">
          <div class="d-flex justify-content-between align-items-center">
            <div class="match-players">
              <i class="bi bi-trophy-fill text-warning me-2"></i>
              <strong>${match.player1}</strong>
              <span class="vs-text mx-2">VS</span>
              <strong>${match.player2}</strong>
            </div>
            <div class="match-actions">
              <button class="btn btn-sm btn-success play-match" data-detailurl="${match.detail_url}">
                <i class="bi bi-controller"></i> Maça Git
              </button>
            </div>
          </div>
        </li>`

		*/
