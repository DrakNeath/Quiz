const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let game = {
  question: "Noch keine Frage",
  players: [],
  votes: {}
};

function publicGame() {
  return game;
}

io.on("connection", (socket) => {
  socket.emit("gameState", publicGame());

  socket.on("addPlayer", ({ name, cameraUrl }) => {
    if (!name || !name.trim()) return;

    const player = {
      id: socket.id + "-" + Date.now(),
      name: name.trim(),
      cameraUrl: cameraUrl || "",
      lives: 3,
      out: false
    };

    game.players.push(player);
    io.emit("gameState", publicGame());
  });

  socket.on("setQuestion", (question) => {
    game.question = question || "Keine Frage eingegeben";
    io.emit("gameState", publicGame());
  });

  socket.on("vote", ({ voterName, targetId }) => {
    if (!voterName || !targetId) return;
    game.votes[voterName.trim()] = targetId;
    io.emit("gameState", publicGame());
  });

  socket.on("loseLife", (playerId) => {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;

    player.lives = Math.max(0, player.lives - 1);
    if (player.lives <= 0) player.out = true;

    io.emit("gameState", publicGame());
  });

  socket.on("addLife", (playerId) => {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;

    player.lives = Math.min(3, player.lives + 1);
    if (player.lives > 0) player.out = false;

    io.emit("gameState", publicGame());
  });

  socket.on("resetVotes", () => {
    game.votes = {};
    io.emit("gameState", publicGame());
  });

  socket.on("applyVoteResult", () => {
    const counts = {};

    Object.values(game.votes).forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    let loserId = null;
    let maxVotes = 0;

    for (const id in counts) {
      if (counts[id] > maxVotes) {
        maxVotes = counts[id];
        loserId = id;
      }
    }

    if (loserId) {
      const player = game.players.find(p => p.id === loserId);
      if (player) {
        player.lives = Math.max(0, player.lives - 1);
        if (player.lives <= 0) player.out = true;
      }
    }

    game.votes = {};
    io.emit("gameState", publicGame());
  });

  socket.on("resetGame", () => {
    game = {
      question: "Noch keine Frage",
      players: [],
      votes: {}
    };
    io.emit("gameState", publicGame());
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Quizshow läuft auf Port ${PORT}`);
});