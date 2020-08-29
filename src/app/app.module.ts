import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { DrawingBoardDirective } from './drawing-board/drawing-board.directive';
import { ChatComponent } from './chat/chat.component';
import {ChatService} from './chat.service';
import {DrawingService} from './drawing.service';
import {GameService} from './game.service';
import { DrawingBoardComponent } from './drawing-board/drawing-board.component';
import { StartComponent } from './start/start.component';
import {RouterModule} from "@angular/router";
import {GameComponent} from "./game/game.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { LobbyComponent } from './lobby/lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    DrawingBoardDirective,
    LobbyComponent,
    ChatComponent,
    DrawingBoardComponent,
    StartComponent,
    GameComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      {
        path: '',
        component: StartComponent,
        data: {state: 'home'}
      },
      {
        path: 'game/:gameId',
        component: GameComponent,
        data: {state: 'game'}
      },
      {
        path: 'game',
        component: GameComponent,
        data: {state: 'game'}
      },
      {
        path: 'lobby',
        component: LobbyComponent,
        data: {state: 'lobby'}
      }
    ])
  ],
  providers: [ChatService, DrawingService, GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
