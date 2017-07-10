import {Component, OnInit, ViewChild} from '@angular/core';
import {DrawingBoardDirective, Path} from "./drawing-board.directive";
import {GameService} from "./game.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  savedPaths: Path[] = [];

  gameId: string;

  @ViewChild('db1') drawingBoard: DrawingBoardDirective;
  @ViewChild('db2') dbClone: DrawingBoardDirective;

  constructor(private _gameService: GameService) {
  }

  ngOnInit(): void {
    this._gameService.newPath.subscribe(path => this.drawingBoard.addPath(path));
    this._gameService.gameIdChange.subscribe(gameId => this.gameId = gameId);
    this.drawingBoard.newPath.subscribe(path => this._gameService.sendNewPath(path));
  }

  reset(): void {
    this.drawingBoard.reset();
  }

  save(): void {
    this.savedPaths = this.drawingBoard.getPaths();
    console.log(this.savedPaths);
  }

  load(): void {
    this.drawingBoard.loadPaths(this.savedPaths);
  }

  undo(): void {
    this.drawingBoard.undo();
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
