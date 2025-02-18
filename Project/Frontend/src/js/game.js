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
    joystickBallRight: null
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
      joystickBallLeft: null,
      joystickBallRight: null
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
      50,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
  );
  gameState.camera.position.set(0, 15, 15);
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
  gameState.joystickStickLeft.position.set(-7, 2.2, 6);
  gameState.scene.add(gameState.joystickStickLeft);

  gameState.joystickStickRight = gameState.joystickStickLeft.clone();
  gameState.joystickStickRight.position.set(7, 2.2, 6);
  gameState.scene.add(gameState.joystickStickRight);


  // Joystick Topu
  const joystickBallGeometry = new THREE.SphereGeometry(0.6, 16, 16);
  const joystickBallMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

  gameState.joystickBallLeft = new THREE.Mesh(joystickBallGeometry, joystickBallMaterial);
  gameState.joystickBallLeft.position.set(-7, 3.2, 6);
  gameState.scene.add(gameState.joystickBallLeft);

  gameState.joystickBallRight = gameState.joystickBallLeft.clone();
  gameState.joystickBallRight.position.set(7, 3.2, 6);
  gameState.scene.add(gameState.joystickBallRight);

  // WebSocket

  const token = localStorage.getItem('accessToken');
  const roomName = getState('detail_url');
  if (token && roomName) {

  gameState.socket = new WebSocket(
      'wss://' + window.location.host + '/game/ws/' + roomName  + 
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
          }

          gameState.paddle1.position.z = state.players.player1.position;
          gameState.paddle2.position.z = state.players.player2.position;
          gameState.ball.position.set(state.ball.x, 1.5, state.ball.y);

          const scoreboard = document.getElementById('scoreboard');
          if (scoreboard) {
              scoreboard.innerText = `P1: ${state.players.player1.score} - P2: ${state.players.player2.score}`;
          }
      }
  };

    gameState.socket.onclose = function() {
        console.log('WebSocket connection closed.');
    }
}
  // Controls
  gameState.handleKeydown = (e) => {
      if (gameState.socket?.readyState === WebSocket.OPEN) {
          if (e.key === 'w' || e.key === 'W') {
              gameState.socket.send(JSON.stringify({
                  type: 'move',
                  player_id: gameState.playerId,
                  move_up: true
              }));
          }
          else if (e.key === 's' || e.key === 'S') {
              gameState.socket.send(JSON.stringify({
                  type: 'move',
                  player_id: gameState.playerId,
                  move_down: true
              }));
          }
      }
  };

  gameState.handleKeyup = (e) => {
    if (gameState.socket?.readyState === WebSocket.OPEN) {
        if (e.key === 'w' || e.key === 'W') {
            gameState.socket.send(JSON.stringify({
                type: 'move',
                player_id: gameState.playerId,
                move_up: false
            }));
        }
        else if (e.key === 's' || e.key === 'S') {
            gameState.socket.send(JSON.stringify({
                type: 'move',
                player_id: gameState.playerId,
                move_down: false
            }));
        }
    }
  };

  document.addEventListener('keyup', gameState.handleKeyup);
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
window.cleanup = cleanupGame;
window.addEventListener('beforeunload', cleanupGame);
document.addEventListener('DOMContentLoaded', initGame);
