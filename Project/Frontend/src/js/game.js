import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.144.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

export function initGame() {





  // Navbar içeriğini yükleme
  fetch('/views/navbar.html')
      .then(response => response.text())
      .then(data => {
          document.getElementById('navbar-container').innerHTML = data;
          console.log('Navbar yüklendi'); // Navbar'ın yüklendiğini kontrol et
      })
      .catch(error => console.error('Navbar yüklenirken hata oluştu:', error));
  const myCanvas = document.getElementById('gameCanvas');
  const container = document.querySelector('.game-area');

  if (!container) {
    console.error('Container element not found');
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas: myCanvas,
    antialias: true
  });

  // Container boyutlarını "piksel" cinsinden alıp renderera atayacağız
  function setRendererSize() {
    const width = container.clientWidth;   // 600
    const height = container.clientHeight; // 400
    renderer.setSize(width, height);
  }
  setRendererSize();

  // === 3) SAHNE ve KAMERA ===
  const scene = new THREE.Scene();

  // Kamera (FOV, en/boy oranı, yakın, uzak)
  let camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 80; // Kamerayı sahneden uzaklaştırdık

  // Pencere yeniden boyutlanırsa (veya container boyutu değişirse) kamera ayarını tazele
  window.addEventListener('resize', () => {
    setRendererSize();
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
  });

  // === 4) IŞIKLAR ===
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0, 0, 100);
  scene.add(pointLight);

  // (İsterseniz büyük bir Plane ekleyerek arka planı da değiştirebilirsiniz)
  // Burada basitçe siyah arka plan bırakıyoruz.

  // === 5) TOP ve RAKETLER ===
  const ballRadius = 2;
  const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
  const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  scene.add(ball);

  const paddleWidth = 2;
  const paddleHeight = 8;
  const paddleDepth = 1;

  // Sol raket
  const leftPaddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
  const leftPaddleMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const leftPaddle = new THREE.Mesh(leftPaddleGeometry, leftPaddleMaterial);
  leftPaddle.position.set(-40, 0, 0);
  scene.add(leftPaddle);

  // Sağ raket
  const rightPaddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
  const rightPaddleMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const rightPaddle = new THREE.Mesh(rightPaddleGeometry, rightPaddleMaterial);
  rightPaddle.position.set(40, 0, 0);
  scene.add(rightPaddle);

  // === 6) WEBSOCKET BAĞLANTISI ===
  // Sunucunuzun gerçek adresine göre wss yolunu düzenleyin
  const myPath = window.location.host;
  const socket = new WebSocket(`wss://${myPath}/game/ws/game/myRoom/`);

  socket.onopen = () => {
    console.log("WebSocket bağlantısı açıldı!");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'init' || data.type === 'state') {
      // Sunucudan oyun durumunu alıyoruz
      updateGameState(data.state);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket bağlantısı kapandı!");
  };

  // === 7) SUNUCUDAN GELEN KOORDİNATLARI SAHNEDE GÜNCELLE ===
  // Örnek olarak sunucunun 0..100 arasında değer gönderdiğini ve 50'nin merkezi temsil ettiğini varsayıyoruz.
  function mapCoord(serverValue) {
    // 0..100 -> -50..+50
    return serverValue;
  }

  function updateGameState(state) {
    // Beklediğimiz state yapısı:
    // { ball_x, ball_y, paddle_left_y, paddle_right_y, score_left, score_right }

    // Top
    ball.position.x = mapCoord(state.ball_x);
    ball.position.y = mapCoord(state.ball_y);

    // Raketler
    leftPaddle.position.y = mapCoord(state.paddle_left_y);
    rightPaddle.position.y = mapCoord(state.paddle_right_y);

    // Skoru DOM'a yaz
    const sb = document.getElementById("scoreboard");
    sb.textContent = `${state.score_left} : ${state.score_right}`;
  }

  // === 8) KLAVYE GİRİŞİ ===
  // Raket kontrolü için sunucuya mesaj gönderiyoruz.
  document.addEventListener("keydown", (e) => {
    if (e.key === 'w') {
      socket.send(JSON.stringify({ action: "left_move", dy: 2 }));
    } else if (e.key === 's') {
      socket.send(JSON.stringify({ action: "left_move", dy: -2 }));
    } else if (e.key === 'ArrowUp') {
      socket.send(JSON.stringify({ action: "right_move", dy: 2 }));
    } else if (e.key === 'ArrowDown') {
      socket.send(JSON.stringify({ action: "right_move", dy: -2 }));
    }
  });

  // === 9) ANİMASYON DÖNGÜSÜ ===
  // (Pozisyonlar sunucudan geldiğinden, burada sadece sahneyi çiziyoruz)
}
