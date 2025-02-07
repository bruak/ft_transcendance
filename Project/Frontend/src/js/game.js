import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.144.0/build/three.module.js';

const scene = new THREE.Scene();

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

function createWall(width, height, depth, position) {
  const wallGeometry = new THREE.BoxGeometry(width, height, depth);
  const wallMaterial = new THREE.MeshStandardMaterial(
    {
      color: 0x555555,
      map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/brick_diffuse.jpg')

    }
  ); // Gri renkli duvar
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(position.x, position.y, position.z);
  wall.rotation.x = Math.PI / 2; // Duvarı yatay konumda oluştur
  scene.add(wall);
}

function createGoal(position, rotation) {
  const goalWidth = 12;
  const goalHeight = 2 * rotation;
  const goalDepth = 0.4;

  // Direkleri oluştur
  const postMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

  // Üst direk
  const topPost = new THREE.Mesh(new THREE.BoxGeometry(goalWidth, 0.2, goalDepth), postMaterial);
  topPost.position.set(position.x + (goalHeight / 2), position.y, position.z);
  topPost.rotation.z = Math.PI / 2;
  scene.add(topPost);

  // // Yan direkler
  const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.2, goalHeight, goalDepth), postMaterial);
  leftPost.position.set(position.x, position.y - (goalWidth / 2), position.z);
  leftPost.rotation.z = Math.PI / 2;
  scene.add(leftPost);

  const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.2, goalHeight, goalDepth), postMaterial);
  rightPost.position.set(position.x, position.y + (goalWidth / 2), position.z);
  rightPost.rotation.z = Math.PI / 2;
  scene.add(rightPost);
}

function createNet(position) {
  const netWidth = 4;
  const netHeight = 2;

  // Ağ dokusu ve transparan yapı
  const netMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    flatShading: true,
    wireframe: true,  // File efekti
    transparent: true, opacity: 0.5, // Hafif şeffaflık
  });

  const netGeometry = new THREE.PlaneGeometry(netWidth, netHeight, 10, 10);
  const net = new THREE.Mesh(netGeometry, netMaterial);
  net.position.set(position.x, position.y, position.z);
  net.rotation.x = Math.PI / 2;
  scene.add(net);
}


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
    60,           // FOV
    canvas.clientWidth / canvas.clientHeight, // en-boy oranı
    0.1,          // near
    1000          // far
  );

  camera.position.set(0, -10, 15); // Kamera pozisyonunu ayarla
  camera.lookAt(0, 0, 0); // Kameranın bakış açısını ayarla

  // 3) Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

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

  const geometry = new THREE.PlaneGeometry(20, 12);
  const textureLoader = new THREE.TextureLoader();
  const grassTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg'); // Çim dokusu

  const material = new THREE.MeshBasicMaterial({ map: grassTexture, side: THREE.DoubleSide });
  const field = new THREE.Mesh(geometry, material);
  field.position.z = -0.5;
  // scene.add(field);

  // createWall(20, 5, 0.2, { x: 0, y: 12 / 2, z: 2 });  // Ön duvar
  // createWall(20, 3, 0.2, { x: 0, y: -12 / 2, z: 0 }); // Arka duvar
  // createGoal({ x: 10, y: 0, z: -0.3 }, 1); // Sol kale
  // createGoal({ x: -10, y: 0, z: -0.3 }, -1); // Sol kale


  paddle1.position.x = -10;
  paddle2.position.x = 10;
  scene.add(paddle1);
  scene.add(paddle2);

  // Top geometrisi
  const ballGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
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

      paddle1.position.y = state.players.player1.position;
      paddle2.position.y = state.players.player2.position;

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
        position_change: 0.5
      }));
    }
    if (e.key === 's' || e.key === 'S') {
      socket.send(JSON.stringify({
        type: 'move',
        player_id: playerId,
        position_change: -0.5
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
