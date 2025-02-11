import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.144.0/build/three.module.js';
import { getState } from './app.js';
document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

// Game state
let gameState = {
  scene: null,
  camera: null,
  renderer: null,
  paddle1: null,
  paddle2: null,
  ball: null,
  socket: null,
  animationId: null,
  playerId: 'spectator',
  handleKeydown: null // Klavye olay fonksiyonunu tutmak için
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

function cleanupGame() {
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

  // Dispose THREE.js objects
  disposeObject(gameState.paddle1);
  disposeObject(gameState.paddle2);
  disposeObject(gameState.ball);

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
      scene: null,
      camera: null,
      renderer: null,
      paddle1: null,
      paddle2: null,
      ball: null,
      socket: null,
      animationId: null,
      playerId: 'spectator',
      handleKeydown: null
  };
}

export function initGame() {
  // Cleanup existing game if any
  cleanupGame();

  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  // Initialize new game
  gameState.scene = new THREE.Scene();
  gameState.scene.background = new THREE.Color(0x000000);

  gameState.camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
  );
  gameState.camera.position.set(0, -10, 15);
  gameState.camera.lookAt(0, 0, 0);

  gameState.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  gameState.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 10, 10);
  gameState.scene.add(ambientLight);
  gameState.scene.add(directionalLight);

  // Game objects
  const paddleGeometry = new THREE.BoxGeometry(1, 3, 0.5);
  const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  
  gameState.paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
  gameState.paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
  gameState.paddle1.position.x = -10;
  gameState.paddle2.position.x = 10;
  
  gameState.scene.add(gameState.paddle1);
  gameState.scene.add(gameState.paddle2);

  const ballGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  gameState.ball = new THREE.Mesh(ballGeometry, ballMaterial);
  gameState.scene.add(gameState.ball);

  // WebSocket
  const token = localStorage.getItem('accessToken');
  const roomName = getState('detail_url');
  gameState.socket = new WebSocket(
      'wss://' + window.location.host + '/game/ws/game/' + roomName  + 
      '?token=' + token
  );

    gameState.socket.onopen = function() {
        console.log('WebSocket connection opened.');
    };
  gameState.socket.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.type === 'init' || data.type === 'game_state') {
          const state = data.state;
          if (data.player_id) {
              gameState.playerId = data.player_id;
              console.log('Player ID:', gameState.playerId);
          }

          gameState.paddle1.position.y = state.players.player1.position;
          gameState.paddle2.position.y = state.players.player2.position;
          gameState.ball.position.set(state.ball.x, state.ball.y, state.ball.z);

          const scoreboard = document.getElementById('scoreboard');
          if (scoreboard) {
              scoreboard.innerText = `P1: ${state.players.player1.score} - P2: ${state.players.player2.score}`;
          }
      }
      else
      {
        console.log(data);
      }
  };

  // <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
  // <button class="btn btn-outline-info">Rastgele Maç</button>
    gameState.socket.onclose = function() {
        console.log('WebSocket connection closed.');
    }
  // Controls
  gameState.handleKeydown = (e) => {
      if (gameState.socket?.readyState === WebSocket.OPEN) {
          if (e.key === 'w' || e.key === 'W') {
              gameState.socket.send(JSON.stringify({
                  type: 'move',
                  player_id: gameState.playerId,
                  position_change: 0.5
              }));
          }
          else if (e.key === 's' || e.key === 'S') {
              gameState.socket.send(JSON.stringify({
                  type: 'move',
                  player_id: gameState.playerId,
                  position_change: -0.5
              }));
          }
      }
  };

  document.addEventListener('keydown', gameState.handleKeydown);

  // Animation
  function animate() {
      gameState.animationId = requestAnimationFrame(animate);
      if (gameState.renderer && gameState.scene && gameState.camera) {
          gameState.renderer.render(gameState.scene, gameState.camera);
      }
  }
  animate();

  // Update home link
  const username = localStorage.getItem('username');
  const homeLink = document.querySelector('.nav-link.active');
  if (homeLink) {
      homeLink.href = `/${username}`;
  }

  // Cleanup on route change
  return () => {
      cleanupGame();
  };
}
document.addEventListener('DOMContentLoaded', initGame);
