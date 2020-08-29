const { textSpanIsEmpty } = require("typescript");

let io;
let gameSocket;
let cache;

/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function (sio, socket, gameCache) {
  cache = gameCache;
  io = sio;
  gameSocket = socket;
  gameSocket.emit('connected', { message: "You are connected!" });

  // Host Events
  gameSocket.on('hostCreateNewGame', hostCreateNewGame);
  gameSocket.on('hostStartGame', endTurn);

  gameSocket.on('newToolData', newToolData);
  gameSocket.on('newDrawingCommand', newDrawingCommand);
  gameSocket.on('viewPortChange', viewPortChange);

  // Player Events
  gameSocket.on('playerJoinGame', playerJoinGame);
  gameSocket.on('playerLeaveRoom', playerLeaveRoom);

  gameSocket.on('initGameData', sendGameDataToPlayer);

  gameSocket.on('hostGameIsRunning', hostGameIsRunning);

  // this is where it would be checked for guessed words
  // ?
  gameSocket.on('sendNewMessage', chatMessage);

  gameSocket.on('endTurn', endTurn);
  gameSocket.on('pickWord', pickWord);

  socket.on("disconnecting", function (data) {
    let rooms = socket.rooms;
    let roomIds = Object.keys(rooms);
    roomIds.forEach(gid => {
    let game = cache.get(gid);
    if (game) {
      game.players.filter((player) => player.id !== this.id);
      cache.set(gid, game);
    }
    });
    roomIds.forEach(room => {
      io.sockets.in(room).emit('playerLeftRoom', {
        originSocketId: this.id
      });
    });
  });
};

function safeGameData(game) {
  return {
    gameId: game.gameId,
    drawing: game.drawing,
    players: game.players,
    turnStarted: game.turnStarted,
    turn: game.turn,
  };
}

function endTurn(data) {
  let game = cache.get(data.gameId);
  if (game) {
    let drawing = (game.drawing + 1) % game.players.length;
    game.drawing = drawing;
    game.pickedWord = '';
    game.turnStarted = 0;
    cache.set(data.gameId, game);
    io.sockets.in(data.gameId).emit('turnPrepare', safeGameData(game));
  }
}

function pickWord(data) {
  let game = cache.get(data.gameId);
  if (game) {
    game.pickedWord = data.pickedWord;
    game.turnStarted = Date.now();
    game.turn = game.turn + 1;
    cache.set(data.gameId, game);
    io.sockets.in(data.gameId).emit('turnStart', safeGameData(game));
  }
}

function playerLeaveRoom(data) {
  let game = cache.get(data.gameId);
  if (game) {

    game.players.filter((player) => player.id !== this.id);
    cache.set(data.gameId, game);
    io.sockets.in(data.gameId).emit('playerLeftRoom', {
      originSocketId: this.id
    });
  }
}

function newDrawingCommand(data) {
  io.sockets.in(data.gameId).emit('newDrawingCommand', data);
}

function newToolData(data) {
  io.sockets.in(data.gameId).emit('newToolData', data);
}

function viewPortChange(data) {
  io.sockets.in(data.gameId).emit('viewPortChange', data);
}

function chatMessage(data) {
  let game = cache.get(data.gameId);
  if (game) {

    if (game.players[game.drawing].id === this.id) {
      return;
    }
    let personalResponse = { gameId: data.gameId, text: data.text, player: this.id, guessed: false, score: 0, close: false };
    if (data.text === game.pickedWord) {
      personalResponse.guessed = true;
      personalResponse.score = 10;
      game.players.filter(player => player.id === this.id).score += 10;
      io.sockets.in(this.id).emit('guessResponse', personalResponse);
      return;
    }
    if (levenstein(data.text, game.pickedWord) <= 2) {
      personalResponse.close = true;
    }
    cache.set(data.gameId, game);
    io.sockets.in(this.id).emit('guessResponse', personalResponse);
    io.sockets.in(data.gameId).emit('chatMessage', {text: data.text, from: game.players.filter(player => player.id === this.id)});
  }
}

/* *******************************
   *                             *
   *       HOST FUNCTIONS        *
   *                             *
   ******************************* */
function hostGameIsRunning(data) {
  io.sockets.in(data.gameId).emit('gameIsRunning', data);
}

/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 */
function hostCreateNewGame(data) {
  // Create a unique Socket.IO Room
  var thisGameId = (Math.random() * 100000) | 0;

  // Return the Room ID (gameId) and the socket ID (originSocketId) to the browser client
  this.emit('newGameCreated', { gameId: thisGameId.toString(), originSocketId: this.id });

  // Join the Room and wait for the players
  this.join(thisGameId.toString());

  cache.set(thisGameId.toString(), { gameId: thisGameId, host: this.id, players: [{ id: this.id, score: 0, name: data.playerName }], word: '', turnStarted: 0, drawing: 0, turn: 0 });
}

/* *****************************
   *                           *
   *     PLAYER FUNCTIONS      *
   *                           *
   ***************************** */

/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data) {
  console.log('Player ' + data.playerName + ' attempting to join game: ' + data.gameId);

  // A reference to the player's Socket.IO socket object
  var sock = this;

  // Look up the room ID in the Socket.IO manager object.
  var room = gameSocket.adapter.rooms[data.gameId];

  // If the room exists...
  if (room != undefined) {
    // attach the socket id to the data object.
    data.originSocketId = sock.id;

    let game = cache.get(data.gameId);
    if (game) {
      // Join the room
      sock.join(data.gameId);

      console.log('Player ' + data.playerName + ' joining game: ' + data.gameId);

      // Emit an event notifying the clients that the player has joined the room.
      io.sockets.in(data.gameId).emit('playerJoinedRoom', data);

      game.players.push({ id: this.id, score: 0, name: data.playerName });
      cache.set(data.gameId, game);

      io.sockets.in(data.gameId).emit('gameUpdate', safeGameData(data));
    }

  } else {
    // Return the Room ID (gameId) and the socket ID (originSocketId) to the browser client
    this.emit('newGameCreated', { gameId: data.gameId.toString(), originSocketId: this.id });

    // Join the Room and wait for the players
    this.join(data.gameId.toString());

    cache.set(data.gameId, { gameId: data.gameId, host: this.id, players: [{ id: this.id, score: 0, name: data.playerName }], word: '', turnStarted: 0, drawing: 0, turn: 0 });

  }
}

function sendGameDataToPlayer(data) {
  let sock = this;
  io.sockets.in(data.playerSocketId).emit('loadGameData', data);
}

function sendGameDataToAll(data) {
  io.sockets.in(data.gameId).emit('loadGameData', data);
}

/* *************************
   *                       *
   *      GAME LOGIC       *
   *                       *
   ************************* */

/*
 * Javascript implementation of Fisher-Yates shuffle algorithm
 * http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
 */
function shuffle(array) {
  var currentIndex = array.length;
  var temporaryValue;
  var randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function levenstein(word, expected) {
  return 1000;
}