// profileController.js

import {
	apiGetUser,
	apiUpdateUserProfile,
	apiSearchUser,
	apiSendFriendRequest,
	apiListFriendRequests,
	apiAcceptFriendRequest,
	apiListFriends,
	apiGetActiveTournaments,
	apiCreateTournament,
	apiRandomMatch,
	apiBotMatch,
	apiGetPlayingMatches,
	apiSignOut,
	apiJoinTournament,
	apiStartTournament,
	apiGetTournamentsMatch,
	apiLocalMatch,
	apiRemoveFriend,
	apiGetPastGames
  } from "/js/profileApi.js";

  import {
	updateProfileUI,
	updateNotifications,
	showToast,
	showErrorMessage,
	debounce,
	renderFriendRequests,
	renderFriendsList,
	renderActiveTournamentsAccordion,
	renderRecentActivities,
	renderTournamentList,
	renderPastGames
  } from "/js/profileUI.js";
  
  // Örnek olarak router, setState, getState gibi fonksiyonlar app.js'den import ediliyorsa:
  import { router, setState, getState } from "/js/app.js";
  import { cleanupGame  } from "/js/game.js";
  /**
   * Sayfa veya rota yüklendiğinde çağrılacak ana fonksiyon.
   * Eski "initProfile" fonksiyonunun temel mantığını barındırır.
   * @param {Object} params
   */

	// Tracking registered event listeners for later cleanup
	const eventListeners = [];

	// Function to safely add event listeners with tracking
	function addTrackedEventListener(element, event, handler, options) {
		if (!element) return;

		element.addEventListener(event, handler, options);
		eventListeners.push({ element, event, handler });
	}


	// WebSocket connection
	let socket = null;
  	const access_token = localStorage.getItem("accessToken");
	// Initialize WebSocket connection
	function initWebSocket(currentUser, userToLoad) {
		if (socket) {
			// Close existing connection if it exists
			socket.close();
		}
		const host = window.location.host;
		socket = new WebSocket(`wss://${host}/notification/ws/notification/?token=${access_token}`);

		socket.onopen = () => {

		};

		socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			const message = data.message;


			if (message === "friend_request") {
				if (userToLoad === currentUser) {
					showFriendRequestsSection(userToLoad);
				}
				updateNotifications();
			}
			else if(message === "remove_friend") {
				showFriendsSection(userToLoad, currentUser);
			}
			else if (message === "create_tournaments" || message === "join_tournaments" || message === "start_tournaments") {
				setupActiveTournamentsAccordion();
			}
			else if (message === "recent_activities") {
				loadRecentActivities();
				loadPastGames(userToLoad);
			}
		};

		socket.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

		return socket;
	}
  
  export async function initProfileController(params = {}) {
	try {

	updateNotifications();
	  // 2) Hangi kullanıcının profilini yükleyeceğiz?
	  const routeUser = params.username || null;
	  const currentUser = localStorage.getItem("username") || null;
	  const userToLoad = routeUser || currentUser;
	  if (!userToLoad) {
		console.error("No username found to load profile.");
		return;
	  }
	  const isOwnProfile = userToLoad === currentUser;
  
	  // Initialize WebSocket for notifications
	  initWebSocket(currentUser,userToLoad);

	  // 3) Profil verisini API'den çek ve UI güncelle
	  await loadProfileData(userToLoad, isOwnProfile);
  
	  // 4) Profil düzenleme formu ayarla (eğer kendi profilimizse)
	  setupProfileForm(isOwnProfile);
  
	  // 5) Arkadaş arama (debounce ile)
	  setupFriendSearch();
  
	  // 6) Gelen arkadaşlık istekleri
	  setupFriendRequestsButton(userToLoad);
  
	  // 7) Arkadaşlar listesi butonu
	  setupFriendsButton(userToLoad, currentUser);
  
	  // 8) Oyun seçenekleri
	  setupGameOptions();
  
	  // 9) Aktif turnuvalar akordiyonu
	  await setupActiveTournamentsAccordion();
  
	  // 10) Çıkış yapma
	  setupSignOutLink();
  
	  // 11) Son etkinlikler
	  await loadRecentActivities();

	  await loadPastGames(userToLoad);
  
	  // Örnek cleanup fonksiyonu isterseniz, window'a atayabilirsiniz:
	  window.cleanupProfile = cleanupProfile;
	} catch (error) {
	  console.error("initProfileController hata:", error);
	  showErrorMessage("Profil yüklenirken bir hata oluştu.");
	}
  }
  
  /* --------------------------------------------------------------------------
	 Aşağıda, initProfileController içinde kullandığımız
	 yardımcı fonksiyonlar (yalnızca "iş mantığı" ve "event binding" içerir).
	 DOM güncellemeleri ve API çağrıları, import ettiğimiz fonksiyonlarla yapılır.
   -------------------------------------------------------------------------- */
  
  
  /** Profil verisini alıp UI'yi günceller */
  async function loadProfileData(userToLoad, isOwnProfile) {
	try
	{
		const user = await apiGetUser(userToLoad);
		if (isOwnProfile) {
			localStorage.setItem("profile_img", user.data.avatar);
		}
		updateProfileUI(user,isOwnProfile);

		
		// Başkasının profilindeysek, düzenleme aksiyonlarını kapat
		if (!isOwnProfile) {
			const profileActions = document.getElementById("profileActions");
			const gameOptionsSection = document.getElementById("gameOptionsSection");
			const activeTournamentsSection = document.getElementById("activeTournamentsSection");
			if (profileActions) {
				profileActions.style.display = "none";
			}
			if (gameOptionsSection) {
				gameOptionsSection.style.display = "none";
			}
			if (activeTournamentsSection) {
				activeTournamentsSection.style.display = "none";
			}
		}
	}
	catch (err)
	{
		history.pushState(null, null, "/404");
		router();
		throw err;
	}


}

	    /**
     * Dosya yükleme işlemlerini ayarlar 
     */
		function initFileUpload() {
			document.getElementById("register-avatar").addEventListener("change", function (event) {
				const file = event.target.files[0];
				const errorElement = document.getElementById('avatar-error');
	
				if (!file) return;
	
				// Dosya türünü kontrol et
				const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
				if (!validTypes.includes(file.type)) {
					errorElement.textContent = 'Lütfen geçerli bir resim dosyası seçin (JPG, JPEG, PNG).';
					errorElement.style.display = 'block';
					this.value = '';
					return;
				}
	
				// Dosya boyutunu kontrol et
				const maxSize = 2 * 1024 * 1024; // 2 MB
				if (file.size > maxSize) {
					errorElement.textContent = 'Resmin boyutu 2MB\'yi aşamaz.';
					errorElement.style.display = 'block';
					this.value = '';
					return;
				}
	
				// Resmi önizle
				const reader = new FileReader();
				reader.onload = function (e) {
					const img = document.getElementById("avatar-preview");
					img.classList.remove("d-none"); // Bootstrap ile görünür yap
					img.src = e.target.result;
				};
				reader.readAsDataURL(file);
			});
		}

	/** Profil düzenleme formunu yönetir (kendi profilimizse) */
	async function setupProfileForm(isOwnProfile) {
		try {
			const settingsForm = document.getElementById("settingsForm");

			if (!settingsForm) return;
				
			// Başka birinin profiliyse formu gizle
			if (!isOwnProfile) {
				settingsForm.style.display = "none";
				return;
			}
			const currentUser = localStorage.getItem("username") || null;
			const userInfo = await apiGetUser(currentUser);

			document.getElementById('settingsFname').value = userInfo.data.first_name;
			document.getElementById('settingsLname').value = userInfo.data.last_name;
			initFileUpload();

			// Kendi profilimizse submit olayını dinle
			addTrackedEventListener(settingsForm, "submit", async (e) => {
			e.preventDefault();

			const firstName = document.getElementById("settingsFname").value;
			const lastName = document.getElementById("settingsLname").value;
			const avatar = document.getElementById("register-avatar").files[0];

			if (!firstName || !lastName) {
				showErrorMessage("Ad ve soyad alanları boş bırakılamaz.");
				return;
			}
			const formData = new FormData();
			formData.append("first_name", firstName);
			formData.append("last_name", lastName);
			if (avatar) {
				formData.append("avatar", avatar);
			}
				const data = await apiUpdateUserProfile(formData);
				showToast("Profil başarıyla güncellendi!");
				const modal = document.getElementById("settingsModal");
				const bootstrapModal = bootstrap.Modal.getInstance(modal);
				if (bootstrapModal) {
					bootstrapModal.hide();
				}
				const userInfo1 = await apiGetUser(currentUser);
				updateProfileUI(userInfo1, true);
				

			});
		} catch (err) {
			console.error("Profil güncellerken hata:", err);
			showErrorMessage("Profil güncellenirken bir hata oluştu.");
		}
	}
  
	/** Arkadaş arama (debounce ile input event) */
	function setupFriendSearch() {
		const friendSearchInput = document.getElementById("friendSearchInput");
		if (!friendSearchInput) return;

		const debouncedSearchHandler = debounce(async () => {
			const searchValue = friendSearchInput.value.trim();
			const suggestionsList = document.getElementById("friendSuggestions");
			if (!suggestionsList) return;

			if (searchValue.length >= 3) {
				suggestionsList.innerHTML = '<li class="list-group-item">Yükleniyor...</li>';
				suggestionsList.style.display = "block";
				try {
					const result = await apiSearchUser(searchValue);
					suggestionsList.innerHTML = "";
					if (Array.isArray(result.data) && result.data.length > 0) {
						result.data.forEach((u) => createSuggestionItem(u, suggestionsList));
					} else if (result.data && typeof result.data === "object") {
						suggestionsList.innerHTML = '<li class="list-group-item">Sonuç bulunamadı.</li>';
					} else {
						suggestionsList.innerHTML = '<li class="list-group-item">Sonuç bulunamadı.</li>';
					}
				} catch (error) {
					console.error("Arkadaş aramada hata:", error);
					suggestionsList.innerHTML =
						'<li class="list-group-item text-danger">Arama sırasında hata oluştu.</li>';
				}
			} else {
				suggestionsList.innerHTML = "";
				suggestionsList.style.display = "none";
			}
		}, 500);

		addTrackedEventListener(friendSearchInput, "input", debouncedSearchHandler);
	}

  
	/** Arkadaş arama sonucu tıklanabilir liste elemanı yaratır */
	function createSuggestionItem(userObj, suggestionsList) {
		const currentUser = localStorage.getItem("username");
		const listItem = document.createElement("li");
		listItem.className = "list-group-item d-flex justify-content-between align-items-center";

		const userNameLink = document.createElement("a");
		userNameLink.href = `profile/${userObj.username}`;
		userNameLink.textContent = `${userObj.first_name} ${userObj.last_name}`;
		userNameLink.className = "text-decoration-none text-white";

		// SPA yönlendirme için event listener ekle
		addTrackedEventListener(userNameLink, "click", function (e) {
			e.preventDefault();
			history.pushState(null, null, this.href);
			router();
		});

		listItem.appendChild(userNameLink);

		// Arkadaş Ekle butonu
		const addButton = document.createElement("button");
		addButton.className = "btn btn-primary btn-sm";
		addButton.textContent = "Arkadaş Ekle";

		if (currentUser && userObj.username) {
			addTrackedEventListener(addButton, "click", () => sendFriendRequest(currentUser, userObj.username));
		} else {
			addTrackedEventListener(addButton, "click", () => alert("Arkadaş eklemek için giriş yapmalısınız."));
		}

		listItem.appendChild(addButton);
		suggestionsList.appendChild(listItem);
	}

  /** Arkadaşlık isteği gönderme */
  async function sendFriendRequest(username, friendUsername) { //bildirimgönderme
	try {
	  await apiSendFriendRequest(username, friendUsername);
	  showToast(`Arkadaşlık isteği gönderildi: ${friendUsername}`);
	  
	} catch (error) {
	  showToast(`Arkadaşlık isteği gönderilemedi: ${error.message}`, "danger");
	}
  }
  

  /** Arkadaşlık isteklerini gösteren buton */ // Şeftali
function setupFriendRequestsButton(userToLoad) {
	const showRequestsBtn = document.getElementById("requestsMenu");
	if (!showRequestsBtn) return;

	addTrackedEventListener(showRequestsBtn, "click", async () => {
		const modal = document.getElementById("requestsModal");
		const bootstrapModal = new bootstrap.Modal(modal);
		bootstrapModal.show();

		addTrackedEventListener(modal, "hidden.bs.modal", () => {
			// Modal cleanup when closed
			const container = document.getElementById("friendRequestsContainer");
			if (container) {
				// Remove all child nodes and their event listeners
				while (container.firstChild) {
					container.removeChild(container.firstChild);
				}
			}
		});

		await showFriendRequestsSection(userToLoad);
	});
}

  /** Arkadaşlık isteklerini gösteren buton */
//   function setupFriendRequestsButton(userToLoad) {
// 	const showRequestsBtn = document.getElementById("requestsMenu");
// 	if (!showRequestsBtn) return;
  
// 	showRequestsBtn.addEventListener("click", async () => {
// 	  const modal = document.getElementById("requestsModal");
// 	  const bootstrapModal = new bootstrap.Modal(modal);
// 	  bootstrapModal.show();
  
// 	  modal.addEventListener("hidden.bs.modal", () => {
// 		// Modal kapanınca temizleme
// 	  });
  
// 	  await showFriendRequestsSection(userToLoad);
// 	});
//   }
  
	/** Modal içinde arkadaşlık isteklerini listeleme ve kabul etme */
	async function showFriendRequestsSection(username) {
		const friendRequestsContainer = document.getElementById("friendRequestsContainer");
		if (!friendRequestsContainer) return;

		try {
			const data = await apiListFriendRequests(username);
			const requests = data.data || [];
			// UI fonksiyonunu kullanıyoruz
			renderFriendRequests(friendRequestsContainer, requests);

			// Kabul et butonları
			const acceptButtons = friendRequestsContainer.querySelectorAll("button[data-friend]");
			acceptButtons.forEach((btn) => {
				addTrackedEventListener(btn, "click", async () => {
					const friendname = btn.getAttribute("data-friend");
					try {
						const result = await apiAcceptFriendRequest(username, friendname);
						if (result) {
							showToast(`${friendname} için arkadaşlık isteğini kabul ettiniz.`, "success");
							btn.parentElement.remove();
						}
					} catch (err) {
						console.error("İstek kabul hatası:", err);
						showToast(`Arkadaşlık isteği kabul edilemedi: ${err.message}`, "danger");
					}
				});
			});
		} catch (err) {
			console.error("listFriendRequests hata:", err);
			friendRequestsContainer.innerHTML =
				`<p class="text-danger">Arkadaşlık istekleri yüklenirken hata oluştu.</p>`;
		}
	}
  
	/** Arkadaş listesini gösteren buton */
	function setupFriendsButton(userToLoad, currentUser) {
		const showFriendsBtn = document.getElementById("viewFriendsButton");
		if (!showFriendsBtn) return;

		addTrackedEventListener(showFriendsBtn, "click", async () => {
			const modal = document.getElementById("friendsModal");
			const bootstrapModal = new bootstrap.Modal(modal);
			bootstrapModal.show();

			addTrackedEventListener(modal, "hidden.bs.modal", () => {
				// Modal kapanınca liste temizleniyor
				document.getElementById("friendsList").innerHTML = "";
				showFriendsBtn.blur();
			});

			await showFriendsSection(userToLoad, currentUser);
		});
	}
  
  /** Arkadaş listesini yükleyip modal'da gösterme */
  async function showFriendsSection(userToLoad, currentUser) {
	const friendsContainer = document.getElementById("friendsList");
	if (!friendsContainer) return;
  
	try {
	  const data = await apiListFriends(userToLoad);
	  const friendsArr = data.data || [];
	  const canRemove = (userToLoad === currentUser);
  
	  // UI fonksiyonunu kullan
	  renderFriendsList(friendsContainer, friendsArr, canRemove, (friendUsername) => {
		apiRemoveFriend(userToLoad, friendUsername);
	});
	} catch (err) {
	  console.error("listFriends hata:", err);
	  friendsContainer.innerHTML = `<p class="text-danger">Arkadaş listesi yüklenirken hata oluştu.</p>`;
	}
  }
  
	/** Oyun seçeneklerini (bot maçı, turnuva, vs.) ayarlar */
	function setupGameOptions() {
		const gameOptionButtons = document.querySelectorAll(".game-option-button");
		gameOptionButtons.forEach((btn) => {
			addTrackedEventListener(btn, "click", async function () {
				const selectedCard = this.closest(".game-option-card");
				const optionId = selectedCard.getAttribute("data-option");
				const optionTitle = selectedCard.querySelector("h3").textContent;

				// Modal başlığı
				const modalTitle = document.getElementById("gameOptionsModalLabel");
				if (modalTitle) {
					modalTitle.textContent = `${optionTitle} Seçenekleri`;
				}

				// Gizli content'ten klonlama
				const hiddenOptions = document.getElementById("hiddenOptions");
				const optionContent = hiddenOptions.querySelector(`#${optionId}`).cloneNode(true);

				const modalContent = document.getElementById("modalContent");
				modalContent.innerHTML = "";
				modalContent.appendChild(optionContent);

				// Turnuva, Rastgele maç vs. alt fonksiyonlar
				if (optionId === "tournamentOptions") {
					setupTournamentCreation(optionContent);
				} else if (optionId === "onlineOptions") {
					setupRandomMatch(optionContent);
					return;
				} else if (optionId === "aiOptions") {
					setupBotMatch();
					return;
				} else if (optionId === "quickMatchOptions") {
					setupQuickMatch();
					return;
				}

				const modal = document.getElementById("gameOptionsModal");
				modal.classList.add("animate__animated", "animate__fadeInDown");
				const bootstrapModal = new bootstrap.Modal(modal);
				bootstrapModal.show();

				addTrackedEventListener(modal, "hidden.bs.modal", () => {
					modal.classList.remove("animate__animated", "animate__fadeInDown");
				});
			});
		});
	}
  
  
	/** Yeni turnuva oluşturma (tournamentOptions altındaki form) */
	function setupTournamentCreation(optionContent) {
		const tournamentMatchBtn = optionContent.querySelector("#createTournamentBtn");
		if (!tournamentMatchBtn) return;

		addTrackedEventListener(tournamentMatchBtn, "click", async () => {
			const tournamentData = {
				name: optionContent.querySelector("#tournamentName").value,
				player_count: optionContent.querySelector("#playerCount").value,
				created_by: localStorage.getItem("username")
			};
			try {
				await apiCreateTournament(tournamentData);
				showToast("Turnuva oluşturuldu!", "success");
			} catch (err) {
				console.error("Turnuva oluşturulurken hata:", err);
				showErrorMessage("Turnuva oluşturulurken bir hata oluştu.");
			}
		});
	}
  
  /** Online -> Rastgele maç ayarı */
  async function setupRandomMatch(optionContent) {

	const data = await apiRandomMatch();
	if (data.data && data.data.detail_url) {
		setState("detail_url", data.data.detail_url);
		history.pushState(null, null, "/GamePage");
		router();
	}

  }
  
  /** Bot maçı ayarı */
  async function setupBotMatch(optionContent) {
	const data = await apiBotMatch();
	if (data.data && data.data.detail_url) {
		setState("detail_url", data.data.detail_url);
		history.pushState(null, null, "/GamePage");
		router();
	}
  }

  async function setupQuickMatch() {
	try {
		const response = await apiLocalMatch();
		if (response.data && response.data.detail_url) {
			setState("detail_url", response.data.detail_url);
			history.pushState(null, null, "/GamePage");
			router();
		}
	}
	catch (error) {
		showToast(error, "danger");
	}
  }
  
  /** Sayfanın altındaki aktif turnuvalar akordiyonu */
  export async function setupActiveTournamentsAccordion() {
	const accordion = document.getElementById("activeTournamentsAccordion");
	if (!accordion) return;
	const currentUser = localStorage.getItem("username") || null;
  
	try {
	  const data = await apiGetActiveTournaments();
	  const tournaments = data.data;
	  // UI fonksiyonunu kullanarak akordiyonu render et
	  renderActiveTournamentsAccordion(accordion, tournaments, currentUser);
  
	// Katıl ve Başlat butonlarına event ekle
	const joinButtons = accordion.querySelectorAll(".join-tournament");
	joinButtons.forEach((button) => {
		addTrackedEventListener(button, "click", async (e) => {
			const tournamentId = e.target.dataset.tournamentId;
			try {
				await apiJoinTournament(tournamentId);
				showToast("Turnuvaya katılma isteğiniz alındı!", "success");
				// Akordiyonu yenile
				await setupActiveTournamentsAccordion();
			} catch (error) {
				console.error("Turnuvaya katılırken hata:", error);
				showToast("Turnuvaya katılırken bir hata oluştu", "danger");
			}
		});
	});

	const startButtons = accordion.querySelectorAll(".start-tournament");
	startButtons.forEach((button) => {
		addTrackedEventListener(button, "click", async (e) => {
			const tournamentId = e.target.dataset.tournamentId;
			try {
				await apiStartTournament(tournamentId);
				showToast("Turnuva başlatıldı!", "success");
				// Gerekirse akordiyonu yenile
				await setupActiveTournamentsAccordion();
			} catch (error) {
				console.error("Turnuva başlatılırken hata:", error);
				showToast("Turnuva başlatılırken bir hata oluştu", "danger");
			}
		});
	});
	  const tournamentsId = tournaments.map(tournament => tournament.tournament_id);
	  const tournamentsMatches = await Promise.all(tournamentsId.map(id => apiGetTournamentsMatch(id)));
  
	  const baseLists = accordion.querySelectorAll(".Base-list");
	  if (baseLists) {
		baseLists.forEach((ListMatch, index) => {
			const match = tournamentsMatches[index];
			if (match && match.data && match.data.length > 0) {
			renderTournamentList(ListMatch, match.data);
			// Add event listeners for the play match buttons
			const playMatchButtons = ListMatch.querySelectorAll(".play-match");
			playMatchButtons.forEach(button => {
				addTrackedEventListener(button, "click", () => {
				const detailUrl = button.getAttribute("data-detailurl");
				joinGame(detailUrl);
				});
			});
			}
		});
	}
	} catch (error) {
	  console.error("Aktif turnuvalar yüklenirken hata:", error);
	  accordion.innerHTML = `
		<div class="alert alert-danger m-3" role="alert">
		  <i class="bi bi-exclamation-triangle"></i> Turnuvalar yüklenirken bir hata oluştu.
		</div>
	  `;
	}
  }
  
  /** Çıkış yapma */
  function setupSignOutLink() {
	const signOutLink = document.querySelector('.dropdown-menu a[href="#signout"]');
	if (!signOutLink) return;
  
	addTrackedEventListener(signOutLink, "click", async () => {
	  try {
		const response = await apiSignOut();
		if (response.ok) {
		  localStorage.clear();
		  history.pushState(null, null, "/");
		  router();
		} else {
		  throw new Error("Çıkış yaparken hata oluştu.");
		}
	  } catch (error) {
		console.error("Çıkış yaparken hata oluştu:", error);
		showErrorMessage("Çıkış yaparken bir hata oluştu.");
	  }
	});
  }
  
  /** Son etkinlikleri (maçlar) yükleyip UI'ye basar */
  async function loadRecentActivities() {
	const recentActivitiesList = document.getElementById("recentActivitiesList");
	if (!recentActivitiesList) return;
  
	try {
	  const activities = await apiGetPlayingMatches();
	  renderRecentActivities(recentActivitiesList, activities.data || []);
  
	  // "İzle" butonlarını handle etmek için
	  const watchButtons = recentActivitiesList.querySelectorAll("button[data-detailurl]");
	  watchButtons.forEach((btn) => {
		addTrackedEventListener(btn, "click", () => {
		  const detailUrl = btn.getAttribute("data-detailurl");
		  joinGame(detailUrl);
		});
	  });
	} catch (error) {
	  console.error("Son etkinlikler yüklenirken hata oluştu:", error);
	  showErrorMessage("Son etkinlikler yüklenirken bir hata oluştu.");
	}
  }

/** Geçmiş oyunları (maçları) yükleyip UI’ye basar */
async function loadPastGames(userToLoad) {
	const pastGamesList = document.getElementById("pastGamesList");
	if (!pastGamesList) return;
  
	try {
	  const games = await apiGetPastGames(userToLoad);
	  renderPastGames(pastGamesList, games.data || []);

	} catch (error) {
	  console.error("Geçmiş oyunlar yüklenirken hata oluştu:", error);
	  showErrorMessage("Geçmiş oyunlar yüklenirken bir hata oluştu.");
	}
  }

  
  /** Bir maçı izlemek için GamePage'e yönlendiren fonksiyon */
  function joinGame(url) {
	setState("detail_url", url);
	history.pushState(null, null, "/GamePage");
	router();
  }
  
	/** Sayfadan ayrılırken yapılacak temizlikler (event listener temizliği vs.) */

	function cleanupProfile() {
		// Remove all tracked event listeners
		eventListeners.forEach(({ element, event, handler }) => {
			element.removeEventListener(event, handler);
		});
		eventListeners.length = 0;

		// Close WebSocket connection if it exists
		if (socket) {

			socket.close();
			socket = null;
		}

	}
