import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.144.0/build/three.module.js';

const scene = new THREE.Scene();

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});



export function initGame() {

  const username = localStorage.getItem('username');

  // Navbar'daki Home linkinin href özelliğini username olarak ayarla
  const homeLink = document.querySelector('.nav-link.active');
  if (homeLink) {
    homeLink.href = username;
  }


  scene.background = new THREE.Color(0x000000);

  // 2) Kamera
  const canvas = document.getElementById('gameCanvas');
  const camera = new THREE.PerspectiveCamera(
    50,           // FOV
    canvas.clientWidth / canvas.clientHeight, // en-boy oranı
    0.1,          // near
    1000          // far
  );
  // **1. Arcade Masası Gövdesi**
  const arcadeBaseGeometry = new THREE.BoxGeometry(14, 1.2, 9);
  const arcadeBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.7 });
  const arcadeBase = new THREE.Mesh(arcadeBaseGeometry, arcadeBaseMaterial);
  scene.add(arcadeBase);

  // **2. Oyun Alanı**
  const playFieldGeometry = new THREE.BoxGeometry(9, 0.3, 5);
  const playFieldMaterial = new THREE.MeshStandardMaterial({ color: 0x0044aa });
  const playField = new THREE.Mesh(playFieldGeometry, playFieldMaterial);
  playField.position.y = 0.75;
  scene.add(playField);

  // **3. Oyun Alanı Kenarları**
  const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 5), borderMaterial);
  leftWall.position.set(-4.6, 0.9, 0);
  scene.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.set(4.6, 0.9, 0);
  scene.add(rightWall);

  const topWall = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.4, 0.2), borderMaterial);
  topWall.position.set(0, 0.9, 2.6);
  scene.add(topWall);

  const bottomWall = topWall.clone();
  bottomWall.position.set(0, 0.9, -2.6);
  scene.add(bottomWall);

  // **4. Orta Çizgi**
  const middleLineMaterial = new THREE.MeshStandardMaterial({ color: 0x00000 });
  const middleLine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.9, 5), middleLineMaterial);
  scene.add(middleLine);

  // **5. Paddle'lar (Oyuncu Çubukları)**
  const paddleGeometry = new THREE.BoxGeometry(0.3, 0.3, 1.2);
  const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

  const leftPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
  leftPaddle.position.set(-4, 0.85, 0);
  scene.add(leftPaddle);

  const rightPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
  rightPaddle.position.set(4, 0.85, 0);
  scene.add(rightPaddle);

  // **6. Joystick ve Butonlar (Farklı Stil)**
  const joystickBaseGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.2, 32);
  const joystickBaseMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });

  const joystickBaseLeft = new THREE.Mesh(joystickBaseGeometry, joystickBaseMaterial);
  joystickBaseLeft.position.set(-4.5, 0.7, 3.5);
  scene.add(joystickBaseLeft);

  const joystickBaseRight = joystickBaseLeft.clone();
  joystickBaseRight.position.set(4.5, 0.7, 3.5);
  scene.add(joystickBaseRight);

  // Joystick Kolu
  const joystickStickGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1.5,16);
  const joystickStickMaterial = new THREE.MeshStandardMaterial({ color: 0xdd0000 });

  const joystickStickLeft = new THREE.Mesh(joystickStickGeometry, joystickStickMaterial);
  joystickStickLeft.position.set(-4.5, 1.4, 3.5);
  scene.add(joystickStickLeft);

  const joystickStickRight = joystickStickLeft.clone();
  joystickStickRight.position.set(4.5, 1.4, 3.5);
  scene.add(joystickStickRight);

  // Joystick Topu
  const joystickBallGeometry = new THREE.SphereGeometry(0.4, 16, 16);
  const joystickBallMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

  const joystickBallLeft = new THREE.Mesh(joystickBallGeometry, joystickBallMaterial);
  joystickBallLeft.position.set(-4.5, 2, 3.5);
  scene.add(joystickBallLeft);

  const joystickBallRight = joystickBallLeft.clone();
  joystickBallRight.position.set(4.5, 2, 3.5);
  scene.add(joystickBallRight);

  // **8. Kamera Ayarları**
  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);

  // 3) Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Işık ekleyelim
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 10, 10);
  scene.add(directionalLight);


  // Top geometrisi
  const ballGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.position.set(0, 1, 0);
  scene.add(ball);

  const scoreboard = document.getElementById('scoreboard');
  let roomName = "room1/";
  const socket = new WebSocket('wss://' + window.location.host + '/game/ws/game/' + roomName + '?token=' + localStorage.getItem('accessToken'));

  let playerId = 'spectator';

  socket.onopen = function () {
    console.log('WebSocket bağlantısı kuruldu.');
  };

  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.type === 'init' || data.type === 'game_state') {
      const state = data.state;


      if (data.player_id) {
        playerId = data.player_id;
      }
      console.log("Kanaldaki Kişi", playerId)

      leftPaddle.position.z = state.players.player1.position;
      rightPaddle.position.z = state.players.player2.position;

      ball.position.x = state.ball.x;
      ball.position.y = state.ball.y;
      ball.position.z = state.ball.z;

      scoreboard.innerText = `P1: ${state.players.player1.score} - P2: ${state.players.player2.score}`;
    }
    else {
      console.log('Sunucudan mesaj alındı:', data);
    }
  };

  socket.onclose = function () {
    console.log('WebSocket bağlantısı kapandı.');
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') {
      socket.send(JSON.stringify({
        type: 'move',
        player_id: playerId,
        position_change: -0.2
      }));
    }
    if (e.key === 's' || e.key === 'S') {
      socket.send(JSON.stringify({
        type: 'move',
        player_id: playerId,
        position_change: 0.2
      }));
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

document.addEventListener('DOMContentLoaded', initGame);
