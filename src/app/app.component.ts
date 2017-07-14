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
    this._gameService.newPath.subscribe(path => this.drawingBoard.addPath(path));
    this._gameService.gameIdChange.subscribe(gameId => this.gameId = gameId);
    this.drawingBoard.newPath.subscribe(path => this._gameService.sendNewPath(path));
    this._gameService.newPlayer.subscribe(name => this.notifyNewPlayer(name));
    this._gameService.gameJoined.subscribe(name => this.notifyWelcome(name));
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
  }


  create() {
    this._gameService.startGame();
  }

  join() {
    this._gameService.joinGame(this.gameId);
  }


  colorChanged(event): void {
    console.log(event);
  }
}
