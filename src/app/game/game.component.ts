import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {GameService} from '../game.service';
import {DrawingBoardComponent} from '../drawing-board/drawing-board.component';
import { ChatComponent } from '../chat/chat.component';
import {ActivatedRoute, ParamMap, Params} from "@angular/router";
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {

  gameId: string;

  @ViewChild('drawingBoard') drawingBoard: DrawingBoardComponent;
  @ViewChild('chat') chat: ChatComponent;

  @ViewChild('drawingBoardContainer') drawingBoardContainer: ElementRef;

  drawingWidth = 800;
  drawingHeight = 600;

  constructor(private _gameService: GameService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      console.log(params);
      // this will be called every time route changes
      // so you can performa your functionality here
      if (params.gameId) {
        this.gameId = params.gameId;
        this.drawingBoard.reset();
        this._gameService.joinGame(this.gameId);
      }
    });

    this._gameService.gameIdChange.subscribe(gameId => this.gameId = gameId);
    this._gameService.newPlayer.subscribe(player => {
      this.notifyNewPlayer(player.playerName);
      if (this._gameService.isHost) {
        this._gameService.sendGameDataToPlayer(this.drawingBoard.toolData, player.originSocketId);
      }
    });
    this._gameService.loadedGameData.subscribe(toolData => {
      this.drawingBoard.toolData = toolData;
    });
    this._gameService.gameJoined.subscribe(player => this.notifyWelcome(player.playerName));
    this.drawingBoard.newToolData.subscribe(toolData => {
      if (toolData.tool === 'pencil') {
        this._gameService.sendNewToolData(toolData);
      }
    });
    this._gameService.newToolData.subscribe(toolData => this.drawingBoard.addToolData(toolData));
    // this.drawingBoard.viewPortChange.subscribe(viewPort => this._gameService.sendViewPortChange(viewPort));
    // this._gameService.viewPortChange.subscribe(viewPort => this.drawingBoard.changeViewPort(viewPort));
    this.drawingBoard.newDrawingCommand.subscribe(command => this._gameService.sendNewDrawingCommand(command));
    this._gameService.newDrawingCommand.subscribe(command => this.drawingBoard.applyDrawingCommand(command));

    console.log(this.drawingBoardContainer.nativeElement.clientHeight);
    console.log(this.drawingBoardContainer.nativeElement.clientWidth);
    this.drawingHeight = this.drawingBoardContainer.nativeElement.clientHeight;
    this.drawingWidth = this.drawingBoardContainer.nativeElement.clientWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.drawingHeight = this.drawingBoardContainer.nativeElement.clientHeight;
    this.drawingWidth = this.drawingBoardContainer.nativeElement.clientWidth;
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
    // this.drawingBoard.drawingDisabled = true;
  }
}
