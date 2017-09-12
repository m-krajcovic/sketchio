import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {GameService} from './game.service';
import {DrawingBoardComponent} from './drawing-board/drawing-board.component';
import { ChatComponent } from './chat/chat.component';
import {routerTransition} from "./router.animations";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [ routerTransition ],
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
  }

  getState(outlet) {
    return outlet.activatedRouteData.state;
  }
}
