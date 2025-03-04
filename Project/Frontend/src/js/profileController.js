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
  
  /**
   * Sayfa veya rota yüklendiğinde çağrılacak ana fonksiyon.
   * Eski "initProfile" fonksiyonunun temel mantığını barındırır.
   * @param {Object} params
   */
	// WebSocket connection
	let socket = null;
  	const access_token = localStorage.getItem("accessToken");
	// Initialize WebSocket connection
	function initWebSocket() {
		if (socket) {
			// Close existing connection if it exists
			socket.close();
		}
		const host = window.location.host;
		socket = new WebSocket(`wss://${host}/notification/ws/notification/?token=${access_token}`);

		socket.onopen = () => {
			console.log("WebSocket connected");
		};

		socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			const message = data.message;
			console.log("WebSocket message:", message);

			if (message === "friend_request") {
				updateNotifications();
			}
			else if (message === "create_tournaments" || message === "join_tournaments" || message === "start_tournaments") {
				setupActiveTournamentsAccordion();
			}
			else if (message === "recent_activities") {
				loadRecentActivities();
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
	  initWebSocket();

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
		updateProfileUI(user);

		
		// Başkasının profilindeysek, düzenleme aksiyonlarını kapat
		if (!isOwnProfile) {
			const profileActions = document.getElementById("profileActions");
			if (profileActions) {
				profileActions.style.display = "none";
			}
		}
	}
	catch (err)
	{
		console.log("windos", window.location.pathname);
		history.pushState(null, null, "/404");
		router();
		throw err;
	}
}
  /** Profil düzenleme formunu yönetir (kendi profilimizse) */
  function setupProfileForm(isOwnProfile) {
	const settingsForm = document.getElementById("settingsForm");
	if (!settingsForm) return;
  
	// Başka birinin profiliyse formu gizle
	if (!isOwnProfile) {
	  settingsForm.style.display = "none";
	  return;
	}
  
	// Kendi profilimizse submit olayını dinle
	settingsForm.addEventListener("submit", async (e) => {
	  e.preventDefault();
	  const formData = new FormData(settingsForm);
	  try {
		const data = await apiUpdateUserProfile(formData);
		if (data.success) {
		  updateProfileUI(data);
		  showToast("Profil başarıyla güncellendi!");
		} else {
		  console.error("Profil güncellenemedi:", data.message || "Bilinmeyen hata.");
		}
	  } catch (err) {
		console.error("Profil güncellerken hata:", err);
		showErrorMessage("Profil güncellenirken bir hata oluştu.");
	  }
	});
  }
  
  /** Arkadaş arama (debounce ile input event) */
  function setupFriendSearch() {
	const friendSearchInput = document.getElementById("friendSearchInput");
	if (!friendSearchInput) return;
	
	friendSearchInput.addEventListener(
	  "input",
	  debounce(async () => {
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
	  }, 500)
	);
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
  
	// SPA yönlendirme
	userNameLink.addEventListener("click", function (e) {
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
	  addButton.onclick = () => sendFriendRequest(currentUser, userObj.username);
	} else {
	  addButton.onclick = () => showToast("Arkadaş eklemek için giriş yapmalısınız.", "warning");
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
  
  /** Arkadaşlık isteklerini gösteren buton */
  function setupFriendRequestsButton(userToLoad) {
	const showRequestsBtn = document.getElementById("requestsMenu");
	if (!showRequestsBtn) return;
  
	showRequestsBtn.addEventListener("click", async () => {
	  const modal = document.getElementById("requestsModal");
	  const bootstrapModal = new bootstrap.Modal(modal);
	  bootstrapModal.show();
  
	  modal.addEventListener("hidden.bs.modal", () => {
		// Modal kapanınca temizleme
	  });
  
	  await showFriendRequestsSection(userToLoad);
	});
  }
  
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
		btn.addEventListener("click", async () => {
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
  
	showFriendsBtn.addEventListener("click", async () => {
	  const modal = document.getElementById("friendsModal");
	  const bootstrapModal = new bootstrap.Modal(modal);
	  bootstrapModal.show();
  
	  modal.addEventListener("hidden.bs.modal", () => {
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
		showFriendsSection(userToLoad, currentUser);
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
	  btn.addEventListener("click", async function () {
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
		  return
		}else if (optionId === "quickMatchOptions") {
			setupQuickMatch();
			return;
		}

		const modal = document.getElementById("gameOptionsModal");
		modal.classList.add("animate__animated", "animate__fadeInDown");
		const bootstrapModal = new bootstrap.Modal(modal);
		bootstrapModal.show();
  
		modal.addEventListener("hidden.bs.modal", () => {
		  modal.classList.remove("animate__animated", "animate__fadeInDown");
		});
	  });
	});
  }
  
  
  /** Yeni turnuva oluşturma (tournamentOptions altındaki form) */
  function setupTournamentCreation(optionContent) {
	const tournamentMatchBtn = optionContent.querySelector("#createTournamentBtn");
	if (!tournamentMatchBtn) return;
  
	tournamentMatchBtn.addEventListener("click", async () => {
	  const tournamentData = {
		name: optionContent.querySelector("#tournamentName").value,
		player_count: optionContent.querySelector("#playerCount").value,
		created_by: localStorage.getItem("username")
	  };
	  try {
		await apiCreateTournament(tournamentData);
		showToast("Turnuva oluşturuldu!", "success");
		// Turnuva oluşturulduktan sonra tekrar turnuvaları yükle
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
		console.log(response.data);
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
	  accordion.querySelectorAll(".join-tournament").forEach((button) => {
		button.addEventListener("click", async (e) => {
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
  
	  accordion.querySelectorAll(".start-tournament").forEach((button) => {
		button.addEventListener("click", async (e) => {
		  const tournamentId = e.target.dataset.tournamentId;
		  try {
			await apiStartTournament(tournamentId);
			// Burdasin 
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
	  baseLists.forEach((ListMatch, index) => {
		const match = tournamentsMatches[index];
		console.log("Match",match);
		if (match && match.data && match.data.length > 0) {
		  renderTournamentList(ListMatch, match.data);
		  // Add event listeners for the play match buttons
		  const playMatchButtons = ListMatch.querySelectorAll(".play-match");
		  playMatchButtons.forEach(button => {
			button.addEventListener("click", () => {
			  const detailUrl = button.getAttribute("data-detailurl");
			  joinGame(detailUrl);
			});
		  });
		} else {
		  console.warn(`No data found for tournament match: ${match}`);
		}
	  });
	  
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
  
	signOutLink.addEventListener("click", async () => {
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
		btn.addEventListener("click", () => {
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
	// Örnek:
	// friendSearchInput.removeEventListener('input', ...);
	// setInterval veya setTimeout temizliği
	console.log("Profile cleanup yapıldı (örnek).");
  }

