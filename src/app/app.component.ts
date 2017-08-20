import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {GameService} from './game.service';
import {DrawingBoardComponent} from './drawing-board/drawing-board.component';
import { ChatComponent } from './chat/chat.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
  }
}
