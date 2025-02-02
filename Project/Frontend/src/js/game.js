import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.144.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

export function initGame() {
/* ============================[*]=NAVBAR=[*]========================== */
  fetch('/views/navbar.html')
      .then(response => response.text())
      .then(data => {
          document.getElementById('navbar-container').innerHTML = data;
      })
      .catch(error => console.error('Navbar yüklenirken hata oluştu:', error));
    

    const scene = new THREE.Scene();

      const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x000000);

    // 2) Kamera
    const camera = new THREE.PerspectiveCamera(
      75,           // FOV
      window.innerWidth / window.innerHeight, // en-boy oranı
      0.1,          // near
      1000          // far
    );
    camera.position.z = 30;

    // 3) Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Işık ekleyelim
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    // Raket geometrisi
    const paddleGeometry = new THREE.BoxGeometry(1, 3, 0.5);
    const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);

    // Raketlerin sahneye eklenmesi
    paddle1.position.x = -10;
    paddle2.position.x = 10;
    scene.add(paddle1);
    scene.add(paddle2);

    // Top geometrisi
    const ballGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    // Skorları gösterecek alan
    const scoreboard = document.getElementById('scoreboard');

    // 4) WebSocket Bağlantısı
    // Projeniz hangi domain/port üzerinde çalışıyorsa ona göre ws:// veya wss:// şeklinde URL'yi düzenleyin.
    const socket = new WebSocket('wss://' + window.location.host + '/game/ws/game/a/');

    let playerId = 'player1'; // Basit örnek, her istemciye manuel atıyoruz.
                              // Sunucuyla kimlik doğrulama vs. geliştirilebilir.

    socket.onopen = function() {
      console.log('WebSocket bağlantısı kuruldu.');
    };

    socket.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.type === 'init' || data.type === 'game_state') {
        const state = data.state;


        // Set player ID if provided by the server
        if (data.player_id) {
          playerId = data.player_id;
        }


        // Raket konumlarını güncelle
        paddle1.position.y = state.players.player1.position;
        paddle2.position.y = state.players.player2.position;

        // Top konumunu güncelle
        ball.position.x = state.ball.x;
        ball.position.y = state.ball.y;
        ball.position.z = state.ball.z;

        // Skorları güncelle
        scoreboard.innerText = `P1: ${state.players.player1.score} - P2: ${state.players.player2.score}`;
      }
    };

    socket.onclose = function() {
      console.log('WebSocket bağlantısı kapandı.');
    };

    // 5) Klavye ile hareket
    // Basit bir örnek olarak: W yukarı, S aşağı
    document.addEventListener('keydown', (e) => {
      if (e.key === 'w' || e.key === 'W') {
        // player1'ı biraz yukarı kaydır
        socket.send(JSON.stringify({
          type: 'move',
          player_id: playerId,
          position_change: 0.5
        }));
      }
      if (e.key === 's' || e.key === 'S') {
        // player1'ı biraz aşağı kaydır
        socket.send(JSON.stringify({
          type: 'move',
          player_id: playerId,
          position_change: -0.5
        }));
      }
    });

    // socket.send(JSON.stringify({ type: 'update_ball' }));

    // 6) Animasyon Döngüsü (render)
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
    }



document.addEventListener('DOMContentLoaded', initGame);
