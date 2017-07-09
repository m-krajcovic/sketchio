import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { DrawingBoardDirective } from './drawing-board.directive';
import { ChatComponent } from './chat/chat.component';
import {ChatService} from "./chat.service";
import {DrawingService} from "./drawing.service";
import {GameService} from "./game.service";

@NgModule({
  declarations: [
    AppComponent,
    DrawingBoardDirective,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [ChatService, DrawingService, GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
