import {Component, OnInit, ViewChild} from '@angular/core';
import {DrawingBoardDirective, Path} from "./drawing-board.directive";
import {GameService} from "./game.service";
import {DrawingBoardComponent} from "./drawing-board/drawing-board.component";
import { ChatComponent } from "./chat/chat.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  savedPaths: Path[] = [];

  gameId: string;

  @ViewChild('drawingBoard') drawingBoard: DrawingBoardComponent;
  @ViewChild('chat') chat: ChatComponent;

  constructor(private _gameService: GameService) {
  }

  ngOnInit(): void {
    this._gameService.gameIdChange.subscribe(gameId => this.gameId = gameId);
    this._gameService.newPlayer.subscribe(name => this.notifyNewPlayer(name));
    this._gameService.gameJoined.subscribe(name => this.notifyWelcome(name));
    this.drawingBoard.newToolData.subscribe(toolData => this._gameService.sendNewToolData(toolData));
    this._gameService.newToolData.subscribe(toolData => this.drawingBoard.addToolData(toolData));
    this.drawingBoard.viewPortChange.subscribe(viewPort => this._gameService.sendViewPortChange(viewPort));
    this._gameService.viewPortChange.subscribe(viewPort => this.drawingBoard.changeViewPort(viewPort));
  }

  notifyNewPlayer(name): void {
    this.chat.addMessage({
      type: 2,
      date: new Date(),
      text: `Player ${name} has joined the game!`,
      playerName: ''
    });
  }

  notifyWelcome(name): void {
    this.chat.addMessage({
      type: 2,
      date: new Date(),
      text: `Welcome to the game ${name}!`,
      playerName: ''
    });
    this.drawingBoard.drawingDisabled = true;
  }


  create() {
    this._gameService.startGame();
  }

  join() {
    this._gameService.joinGame(this.gameId);
  }
}
