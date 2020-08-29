import { Component, OnInit, Input } from '@angular/core';
import {GameService} from "../game.service";
import {Router} from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  private gameId;
  private isHost = false;
  private players = [];

  constructor(private _gameService: GameService,
              private router: Router) { }

  ngOnInit() {
    this.isHost = this._gameService.isHost;

    this._gameService.gameDataChange.subscribe(gameUpdate => {
        this.gameId = gameUpdate.gameId;
        this.players = gameUpdate.players;
    })
  }

  start() {
    this._gameService.startGame();
  }

}
