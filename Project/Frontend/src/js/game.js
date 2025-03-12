import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.144.0/build/three.module.js';
import { getState, router } from './app.js';


function hideSpinner() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Game state
let gameState = {
    mode: 'multi',
    scene: null,
    camera: null,
    renderer: null,
    paddle1: null,
    paddle2: null,
    ball: null,
    socket: null,
    animationId: null,
    playerId: 'spectator',
    handleKeydown: null, // Klavye olay fonksiyonunu tutmak için
    arcadeBase: null,
    playField: null,
    leftWall: null,
    rightWall: null,
    topWall: null,
    bottomWall: null,
    middleLine: null,
    joystickBaseLeft: null,
    joystickBaseRight: null,
    joystickStickLeft: null,
    joystickStickRight: null,
    joystickBallLeft: null,
    joystickBallRight: null,
    GroupLeft: null,
    GroupRight: null
};

function disposeObject(obj) {
    if (!obj) return;
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
        if (Array.isArray(obj.material)) {
            obj.material.forEach(material => material.dispose());
        } else {
            obj.material.dispose();
        }
    }
}

export function cleanupGame() {
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }

    if (gameState.socket) {
        gameState.socket.close();
    }

    // Remove event listener
    if (gameState.handleKeydown) {
        document.removeEventListener('keydown', gameState.handleKeydown);
    }
    if (gameState.handleKeyup) {
        document.removeEventListener('keyup', gameState.handleKeyup);
    }


    // Dispose THREE.js objects
    disposeObject(gameState.paddle1);
    disposeObject(gameState.paddle2);
    disposeObject(gameState.ball);
    disposeObject(gameState.arcadeBase);
    disposeObject(gameState.playField);
    disposeObject(gameState.leftWall);
    disposeObject(gameState.rightWall);
    disposeObject(gameState.topWall);
    disposeObject(gameState.bottomWall);
    disposeObject(gameState.middleLine);
    disposeObject(gameState.joystickBaseLeft);
    disposeObject(gameState.joystickBaseRight);
    disposeObject(gameState.joystickStickLeft);
    disposeObject(gameState.joystickStickRight);
    disposeObject(gameState.joystickBallLeft);
    disposeObject(gameState.joystickBallRight);

    if (gameState.scene) {
        while (gameState.scene.children.length > 0) {
            const object = gameState.scene.children[0];
            gameState.scene.remove(object);
            disposeObject(object);
        }
    }

    if (gameState.renderer) {
        gameState.renderer.dispose();
    }

    // Reset game state
    gameState = {
        mode: 'multi',
        scene: null,
        camera: null,
        renderer: null,
        paddle1: null,
        paddle2: null,
        ball: null,
        socket: null,
        animationId: null,
        playerId: 'spectator',
        handleKeydown: null,
        handleKeyup: null,
        arcadeBase: null,
        playField: null,
        leftWall: null,
        rightWall: null,
        topWall: null,
        bottomWall: null,
        middleLine: null,
        joystickBaseLeft: null,
        joystickBaseRight: null,
        joystickStickLeft: null,
        joystickStickRight: null,
        joystickBallRight: null,
        GroupLeft: null,
        GroupRight: null
    };
}

export function initGame() {
    cleanupGame();
    const roomName = getState('detail_url');
    if (roomName) {
        if (roomName.split('/')[0] === 'local')
        {
            gameState.mode = 'local';
        }
        else {
            gameState.mode = 'multi';
        }
    }
    // Navbar'daki Home linkinin href özelliğini username olarak ayarla
    const navbarUsername = localStorage.getItem('username');
    const homeLink = document.getElementById('home');
    if (homeLink && navbarUsername) {
        homeLink.href = "profile/" + navbarUsername;
    }
    // showGameOverScreen(); 
    const canvas = document.getElementById('gameCanvas');
    const gameContainer = document.getElementById('game-container');
    if (!canvas || !gameContainer) return;

    // Canvas boyutlarını ayarlayan fonksiyon
    function updateCanvasSize() {
        const containerWidth = gameContainer.clientWidth; 
        const containerHeight = gameContainer.clientHeight;

        // En-boy oranını koru (4:3)
        const aspectRatio = 4 / 3;

        let newWidth, newHeight;

        if (containerWidth / containerHeight > aspectRatio) {
            // Container daha geniş, yüksekliğe göre ayarla
            newHeight = Math.min(containerHeight, window.innerHeight * 0.8);
            newWidth = newHeight * aspectRatio;
        } else {
            // Container daha dar, genişliğe göre ayarla
            newWidth = Math.min(containerWidth, window.innerWidth * 0.9);
            newHeight = newWidth / aspectRatio;
        }

        // Canvas boyutlarını güncelle
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;

        // Renderer boyutlarını güncelle
        if (gameState.renderer) {
            gameState.renderer.setSize(newWidth, newHeight);
        }

        // Kamera aspect ratio'sunu güncelle
        if (gameState.camera) {
            gameState.camera.aspect = newWidth / newHeight;
            gameState.camera.updateProjectionMatrix();
        }
    }

    // Resize event listener
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(gameContainer);

    // Initial setup
    gameState.scene = new THREE.Scene();
    gameState.scene.background = new THREE.Color(0x000000);

    gameState.camera = new THREE.PerspectiveCamera(
        50,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    gameState.camera.position.set(0, 15, 15);
    gameState.camera.lookAt(0, 0, 0);

    gameState.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        powerPreference: "high-performance"
    });

    // İlk boyut ayarlaması
    updateCanvasSize();

    // Cleanup fonksiyonuna ResizeObserver'ı ekle
    const originalCleanup = cleanupGame;
    cleanupGame = () => {
        resizeObserver.disconnect();
        originalCleanup();
    };

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 10);
    gameState.scene.add(ambientLight);
    gameState.scene.add(directionalLight);

    // Game objects
    const paddleGeometry = new THREE.BoxGeometry(0.5, 0.5, 2);
    const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    gameState.paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    gameState.paddle1.position.set(-6.5, 1.5, 0);
    gameState.scene.add(gameState.paddle1);


    gameState.paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    gameState.paddle2.position.set(6.5, 1.5, 0);
    gameState.scene.add(gameState.paddle2);

    const ballGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    gameState.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    gameState.ball.position.set(0, 1.5, 0);
    gameState.scene.add(gameState.ball);

    // **1. Arcade Masası Gövdesi**
    const arcadeBaseGeometry = new THREE.BoxGeometry(20, 2, 14);
    const arcadeBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.7 });
    gameState.arcadeBase = new THREE.Mesh(arcadeBaseGeometry, arcadeBaseMaterial);
    gameState.arcadeBase.position.set(0, 0, 0);
    gameState.scene.add(gameState.arcadeBase);

    // **2. Oyun Alanı**
    const playFieldGeometry = new THREE.BoxGeometry(14, 0.5, 8);
    const playFieldMaterial = new THREE.MeshStandardMaterial({ color: 0x0044aa });
    gameState.playField = new THREE.Mesh(playFieldGeometry, playFieldMaterial);
    gameState.playField.position.y = 0.76;
    gameState.scene.add(gameState.playField);

    // **3. Oyun Alanı Kenarları**
    const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    gameState.leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 8), borderMaterial);
    gameState.leftWall.position.set(-7.2, 1.5, 0);
    gameState.scene.add(gameState.leftWall);

    gameState.rightWall = gameState.leftWall.clone();
    gameState.rightWall.position.set(7.2, 1.5, 0);
    gameState.scene.add(gameState.rightWall);


    gameState.topWall = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.6, 0.4), borderMaterial);
    gameState.topWall.position.set(0, 1.5, 4.2);
    gameState.scene.add(gameState.topWall);

    gameState.bottomWall = gameState.topWall.clone();
    gameState.bottomWall.position.set(0, 1.5, -4.2);
    gameState.scene.add(gameState.bottomWall);

    gameState.GroupLeft = new THREE.Group();
    gameState.GroupRight = new THREE.Group();

    // **6. Joystick ve Butonlar (Farklı Stil)**
    const joystickBaseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.3, 32);
    const joystickBaseMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });

    gameState.joystickBaseLeft = new THREE.Mesh(joystickBaseGeometry, joystickBaseMaterial);
    gameState.joystickBaseLeft.position.set(-7, 1.2, 6);
    gameState.scene.add(gameState.joystickBaseLeft);

    gameState.joystickBaseRight = gameState.joystickBaseLeft.clone();
    gameState.joystickBaseRight.position.set(7, 1.2, 6);
    gameState.scene.add(gameState.joystickBaseRight);

    // Joystick Kolu
    const joystickStickGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 16);
    const joystickStickMaterial = new THREE.MeshStandardMaterial({ color: 0xdd0000 });

    gameState.joystickStickLeft = new THREE.Mesh(joystickStickGeometry, joystickStickMaterial);
    gameState.joystickStickLeft.position.set(0, 1.2, 0);
    gameState.scene.add(gameState.joystickStickLeft);

    gameState.joystickStickRight = gameState.joystickStickLeft.clone();
    gameState.joystickStickRight.position.set(0, 1.2, 0);
    gameState.scene.add(gameState.joystickStickRight);


    // Joystick Topu
    const joystickBallGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const joystickBallMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    gameState.joystickBallLeft = new THREE.Mesh(joystickBallGeometry, joystickBallMaterial);
    gameState.joystickBallLeft.position.set(0, 2, 0);
    gameState.scene.add(gameState.joystickBallLeft);

    gameState.joystickBallRight = gameState.joystickBallLeft.clone();
    gameState.joystickBallRight.position.set(0, 2, 0);
    gameState.scene.add(gameState.joystickBallRight);

    gameState.GroupLeft.add(gameState.joystickBallLeft);
    gameState.GroupLeft.add(gameState.joystickStickLeft);
    gameState.GroupLeft.position.set(-7, 1.2, 6);
    gameState.scene.add(gameState.GroupLeft);

    gameState.GroupRight.add(gameState.joystickBallRight);
    gameState.GroupRight.add(gameState.joystickStickRight);
    gameState.GroupRight.position.set(7, 1.2, 6);
    gameState.scene.add(gameState.GroupRight);
    // WebSocket

    const token = localStorage.getItem('accessToken');
    
    if (token && roomName) {

        gameState.socket = new WebSocket(
            'wss://' + window.location.host + '/game/ws/' + roomName +
            '?token=' + token
        );
        

        gameState.socket.onopen = function () {
        };
        gameState.socket.onmessage = function (event) {
            const data = JSON.parse(event.data);
            if ( data.type === 'game_state') {
                const state = data.state;
                if (data.player_id) {
                    gameState.playerId = data.player_id;
                }
                const moveleft = state.players.player1.move_up ? 'up' : state.players.player1.move_down ? 'down' : null;
                const moveright = state.players.player2.move_up ? 'up' : state.players.player2.move_down ? 'down' : null;
                if (moveleft){
                    moveJoystic(moveleft, 'left');
                }
                else{
                    removejoystickStick('left');
                }
                if (moveright){
                    moveJoystic(moveright, 'right');
                }
                else{
                    removejoystickStick('right');
                }
                gameState.paddle1.position.z = state.players.player1.position;
                gameState.paddle2.position.z = state.players.player2.position;
                gameState.ball.position.set(state.ball.x, 1.5, state.ball.y);
                
                const scoreboard = document.getElementById('scoreboard');
                if (scoreboard) {
                    scoreboard.innerText = `P1: ${state.players.player1.score} - P2: ${state.players.player2.score}`;
                }
            }
            else if (data.type === 'game_status') {
                if (data.status === 'start')
                {
                    hideSpinner();
                }
                else if (data.status === 'game_over') {
                    cleanupGame();
                    showGameOverScreen();
                }
            }
        };

        gameState.socket.onclose = function () {
        }

        gameState.socket.onerror = function (error) {
            console.error('WebSocket error:', error);
        };
        
    }
    // Controls
    const keyMap = {
        local: {
          w:         { player: "player1", property: "move_up" },
          W:         { player: "player1", property: "move_up" },
          s:         { player: "player1", property: "move_down" },
          S:         { player: "player1", property: "move_down" },
          ArrowUp:   { player: "player2", property: "move_up" },
          ArrowDown: { player: "player2", property: "move_down" },
        },
        multi: {
          w: { property: "move_up" },
          W: { property: "move_up" },
          s: { property: "move_down" },
          S: { property: "move_down" },
        }
      };

    function buildMovePayload(mode, key, isPressed, playerId) {
        const entry = keyMap[mode][key];
        
        if (!entry) return null;
      
        const payload = { type: "move" };
      
        if (mode === "multi") {
          payload.player_id = playerId;
        } else {
          payload.player = entry.player;
        }
      
        if (entry.property === "move_up") {
          payload.move_up = isPressed;
        } 
        if (entry.property === "move_down") {
          payload.move_down = isPressed;
        }
        return payload;
      }

      const keysPressed = {};

      gameState.handleKeydown = (e) => {
          keysPressed[e.key] = true;
  
          // Prevent scrolling when using game controls
          if (['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
          }
  
          if (gameState.socket?.readyState === WebSocket.OPEN) {
              const payload = buildMovePayload(
                  gameState.mode,
                  e.key,
                  true,
                  gameState.playerId
              );
  
              if (payload) {
                  gameState.socket.send(JSON.stringify(payload));
              }
          }
      };

    gameState.handleKeyup = (e) => {
    keysPressed[e.key] = false;

    if (gameState.socket?.readyState === WebSocket.OPEN) {
        const payload = buildMovePayload(
        gameState.mode,
        e.key,
        false,
        gameState.playerId
        );
        
        if (payload) {
        gameState.socket.send(JSON.stringify(payload));
        }
    }
    };

    document.addEventListener('keyup', gameState.handleKeyup);
    document.addEventListener('keydown', gameState.handleKeydown);

    // Focus the canvas when the game is loaded
    canvas.focus();

    // Animation
    function animate() {
        gameState.animationId = requestAnimationFrame(animate);
        if (gameState.renderer && gameState.scene && gameState.camera) {
            gameState.renderer.render(gameState.scene, gameState.camera);
        }
    }
    animate();


    window.cleanup = cleanupGame;
    return () => {
        cleanupGame();
    };
}

document.addEventListener('DOMContentLoaded', initGame);

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function moveJoystic(move, who) {
    if (who === 'left') {
        if (move === 'up' && gameState.GroupLeft.rotation.x > -0.4) {
            gameState.GroupLeft.rotation.x -= 0.1;
        } else if (move === 'down' && gameState.GroupLeft.rotation.x < 0.4) {
            gameState.GroupLeft.rotation.x += 0.1;
        }
        console.log('GroupLeft',gameState.GroupLeft.rotation.x);
    }
    else if (who === 'right') {
        if (move === 'up' && gameState.GroupRight.rotation.x > -0.4) {
            gameState.GroupRight.rotation.x -= 0.1;
        } else if (move === 'down' && gameState.GroupRight.rotation.x < 0.4) {
            gameState.GroupRight.rotation.x += 0.1;
        }
    }
}

function removejoystickStick(who) {
    const group = who === 'right' ? gameState.GroupRight : gameState.GroupLeft;
    
    const step = 0.1;        // bir adımda döndürme miktarı
    const threshold = 0.1;   // 0’a yeterince yaklaştığımız “eşik” aralığı

    if (Math.abs(group.rotation.x) < threshold) {
        group.rotation.x = 0;
    } 
    else if (group.rotation.x > 0) {
        group.rotation.x -= step;
        if (group.rotation.x < 0) {
            group.rotation.x = 0;
        }
    } 
    else if (group.rotation.x < 0) {
        group.rotation.x += step;
        if (group.rotation.x > 0) {
            group.rotation.x = 0;
        }
    }
}

// Window resize event listener
window.addEventListener('resize', throttle(() => {
    if (gameState.camera && gameState.renderer) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const container = canvas.parentElement;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // En-boy oranını koru (4:3)
            const aspectRatio = 4 / 3;

            let newWidth, newHeight;

            if (containerWidth / containerHeight > aspectRatio) {
                // Container daha geniş, yüksekliğe göre ayarla
                newHeight = Math.min(containerHeight, window.innerHeight * 0.8);
                newWidth = newHeight * aspectRatio;
            } else {
                // Container daha dar, genişliğe göre ayarla
                newWidth = Math.min(containerWidth, window.innerWidth * 0.9);
                newHeight = newWidth / aspectRatio;
            }

            // Canvas ve renderer boyutlarını güncelle
            canvas.style.width = `${newWidth}px`;
            canvas.style.height = `${newHeight}px`;
            gameState.renderer.setSize(newWidth, newHeight, false);

            // Kamera aspect ratio'sunu güncelle
            gameState.camera.aspect = newWidth / newHeight;
            gameState.camera.updateProjectionMatrix();
        }
    }
}, 100)); // 100ms throttle


//"Game Over" overlay oluşturma kodu
function showGameOverScreen() {
    const gameContainer = document.getElementById('game-container');
  
    // Var olan overlay varsa kaldır
    let existingOverlay = document.querySelector('.game-over-screen');
    if (existingOverlay) {
      existingOverlay.remove();
    }
  
    const overlay = document.createElement('div');
    overlay.className = 'game-over-screen';
    overlay.innerHTML = `
        <h2>Oyun Bitti!</h2>
        <div>
            <button id="menuButton" onclick="goToMenu()">Ana Menü</button>
        </div>
    `;
    gameContainer.appendChild(overlay);
  
    // Butonun overlay alanı içinde kalmasını sağlayan ve ilk konumunu doğru ayarlayan fonksiyon
    const menuButton = document.getElementById('menuButton');
  
    
    function repositionButton() {
        // Butonun genişliğini ve yüksekliğini alıyoruz
        const btnWidth = menuButton.offsetWidth;
        const btnHeight = menuButton.offsetHeight;
        // Overlay'in iç boyutlarını alıyoruz
        const overlayWidth = overlay.clientWidth;
        const overlayHeight = overlay.clientHeight;
        
        // Butonun tamamen görünür kalması için maksimum X ve Y değerlerini hesaplıyoruz
        const maxX = overlayWidth - btnWidth;
        const maxY = overlayHeight - btnHeight;
        
        // Rastgele koordinatlar üretiyoruz
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
        // Butonun yeni konumuna yumuşak geçişle hareket etmesi için left ve top değerlerini güncelliyoruz
        menuButton.style.left = randomX + 'px';
        menuButton.style.top = randomY + 'px';
    }
    
    // İlk konumlandırmayı, overlay tamamen render edildikten sonra yapıyoruz
    requestAnimationFrame(repositionButton);

    
    // // Fare buton üzerine geldiğinde konumu yeniden hesapla
    menuButton.addEventListener('mouseover', repositionButton);
  }
  


window.goToMenu = function () {
    const username = localStorage.getItem('username');
    history.pushState(null, null, `/profile/${username}`);  // Giriş yaptıktan sonra yönlendirilen sayfa
    router();
}
