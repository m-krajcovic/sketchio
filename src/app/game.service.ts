import {EventEmitter, Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Path} from "./drawing-board.directive";

export class Player {

}

@Injectable()
export class GameService {

  newPath: EventEmitter<Path>;

  gameId: string;
  socketId: string;
  me: Player;
  players: Player[];

  socket;

  constructor() {
    this.newPath = new EventEmitter<Path>();
    this.socket = io.connect();
    this.socket.on('connected', this.onConnected.bind(this));
    this.socket.on('newGameCreated', this.onNewGameCreated.bind(this));
    this.socket.on('playerJoinedRoom', this.onPlayerJoinedRoom.bind(this));
    this.socket.on('newPath', this.onNewPath.bind(this));
  }

  startGame(): void {
    this.socket.emit('hostCreateNewGame');
  }

  onNewGameCreated(data): void {
    console.log(data);
    this.gameId = data.gameId;
    this.socketId = data.mySocketId;
  }

  onConnected(): void {
    console.log(this.socket);
  }

  joinGame(gameId: string) {
    let data = {
      gameId: gameId,
      playerName: 'anon'
    };

    // Send the gameId and playerName to the server
    this.socket.emit('playerJoinGame', data);
  }


  onPlayerJoinedRoom(data) {
    console.log(data);
    if (this.socketId === data.originSocketId) {
      this.gameId = data.gameId;
    }
  }

  onNewPath(data) {
    console.log(data);
    if (data.originSocketId !== this.socketId) {
      this.newPath.next(data.path);
    }
  }

  sendNewPath(path: Path): void {

    this.socket.emit('newPath', {
      gameId: this.gameId,
      originSocketId: this.socketId,
      path: path
    });
  }
}
