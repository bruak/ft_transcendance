const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let socket = new WebSocket("wss://localhost:8080//game/ws/game/");

socket.onopen = () => {
  console.log("Bağlantı açıldı!");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'state') {
    // Oyun durumunu çizelim
    drawGame(data.state);
  } else if (data.type === 'init') {
    drawGame(data.state);
  }
};

socket.onclose = () => {
  console.log("Bağlantı kapandı!");
};

function drawGame(state) {
  // state: { ball_x, ball_y, paddle_left_y, paddle_right_y, score_left, score_right }
  // Canvas ölçüleri ile orantılamanız gerekebilir
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // basit orantı => server [0..100], canvas [0..400]
  let scaleX = canvas.width / 100;
  let scaleY = canvas.height / 100;

  // top
  ctx.beginPath();
  ctx.arc(state.ball_x * scaleX, state.ball_y * scaleY, 5, 0, 2*Math.PI);
  ctx.fill();

  // sol paddle
  ctx.fillRect(5, state.paddle_left_y * scaleY - 10, 5, 20);

  // sağ paddle
  ctx.fillRect(canvas.width - 10, state.paddle_right_y * scaleY - 10, 5, 20);

  // skorlar
  ctx.font = "20px Arial";
  ctx.fillText(state.score_left, canvas.width/2 - 50, 30);
  ctx.fillText(state.score_right, canvas.width/2 + 50, 30);
}

// Klavye ile paddle hareketi
document.addEventListener('keydown', (e) => {
  if (e.key === 'w') {
    socket.send(JSON.stringify({action: "move_left", dy: -2}));
  } else if (e.key === 's') {
    socket.send(JSON.stringify({action: "move_left", dy: 2}));
  } else if (e.key === 'ArrowUp') {
    socket.send(JSON.stringify({action: "move_right", dy: -2}));
  } else if (e.key === 'ArrowDown') {
    socket.send(JSON.stringify({action: "move_right", dy: 2}));
  }
});