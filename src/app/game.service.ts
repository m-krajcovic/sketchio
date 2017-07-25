import {EventEmitter, Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Path} from "./drawing-board.directive";
import {ToolData} from "./drawing-board.directive";
import {ViewPort} from "./drawing-board.directive";

export class Player {

}

@Injectable()
export class GameService {

  newToolData:EventEmitter<ToolData>;
  gameIdChange:EventEmitter<string>;
  newPlayer:EventEmitter<string>;
  gameJoined:EventEmitter<string>;
  viewPortChange:EventEmitter<ViewPort>;

  gameId:string;
  socketId:string;
  me:Player;
  players:Player[];

  socket;

  constructor() {
    this.newToolData = new EventEmitter<ToolData>();
    this.gameIdChange = new EventEmitter<string>();
    this.newPlayer = new EventEmitter<string>();
    this.gameJoined = new EventEmitter<string>();
    this.viewPortChange = new EventEmitter<ViewPort>();
    this.socket = io.connect();
    this.socket.on('connected', this.onConnected.bind(this));
    this.socket.on('newGameCreated', this.onNewGameCreated.bind(this));
    this.socket.on('playerJoinedRoom', this.onPlayerJoinedRoom.bind(this));
    this.socket.on('newPath', this.onNewPath.bind(this));
    this.socket.on('viewPortChange', this.onViewPortChange.bind(this));
  }

  startGame():void {
    this.socket.emit('hostCreateNewGame');
  }

  onNewGameCreated(data):void {
    this.gameId = data.gameId;
    this.gameIdChange.next(this.gameId);
  }

  onConnected():void {
    this.socketId = this.socket.id;
  }

  joinGame(gameId:string) {
    let data = {
      gameId: gameId,
      playerName: 'anon'
    };

    // Send the gameId and playerName to the server
    this.socket.emit('playerJoinGame', data);
  }


  onPlayerJoinedRoom(data) {
    if (this.socketId === data.originSocketId) {
      this.gameId = data.gameId;
      this.gameIdChange.next(this.gameId);
      this.gameJoined.next(data.playerName);
    } else {
      this.newPlayer.next(data.playerName);
    }
  }

  onNewPath(data) {
    if (data.originSocketId !== this.socketId) {
      this.newToolData.next(data.toolData);
    }
  }

  onViewPortChange(data) {
    if (data.originSocketId !== this.socketId) {
      this.viewPortChange.next(data.viewPort);
    }
  }

  sendNewToolData(toolData:ToolData):void {
    this.socket.emit('newPath', {
      gameId: this.gameId,
      originSocketId: this.socketId,
      toolData: toolData
    });

  }

  sendViewPortChange(viewPort:ViewPort) {
    var varArgs = {
      gameId: this.gameId,
      originSocketId: this.socketId,
      viewPort: {
        width: viewPort.width,
        height: viewPort.height,
        zoom: viewPort.zoom,
        start: viewPort.start,
      }
    };
    this.socket.emit('viewPortChange', varArgs);
  }
}
