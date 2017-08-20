import { Component, OnInit } from '@angular/core';
import {GameService} from "../game.service";
import {Router} from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  private gameId;

  constructor(private _gameService: GameService,
              private router: Router) { }

  ngOnInit() {
    this._gameService.gameIdChange.subscribe(gameId => {
      this.gameId = gameId;
      this.router.navigateByUrl(`/game/${this.gameId}`);
    });
  }

  create() {
    this._gameService.startGame();
  }

  join() {
    this._gameService.joinGame(this.gameId);
  }

}
