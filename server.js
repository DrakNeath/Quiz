const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Gemeinsamer Spielzustand für alle verbundenen Browser
let gameState = {
  players: [],
  host: { name: "", cameraUrl: "" },
  gameStarted: false,
  votingOpen: false,
  votes: {},
  lockedVotes: {},
  selectedLoserId: null,
  showFinalResult: false,
  questions: [],
  usedQuestionIndexes: [],
  currentQuestion: "Noch keine Frage gewählt",
  currentAnswer: "-",
  currentTurnIndex: -1,
  timerSeconds: 0
};

io.on("connection", socket => {
  console.log("Client verbunden:", socket.id);

  socket.emit("state:init", gameState);

  socket.on("state:update", newState => {
    gameState = {
      ...gameState,
      ...newState
    };

    socket.broadcast.emit("state:update", gameState);
  });

  socket.on("disconnect", () => {
    console.log("Client getrennt:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Quizshow läuft auf http://localhost:${PORT}`);
});
