import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";

export class ChatMessage {
  date: Date;
  playerName: string;
  text: string;
  type: number;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateY(0)', opacity: 1})),
      transition('void => *', [
        style({transform: 'translateY(100%)', opacity: 0}),
        animate(500)
      ]),
      transition('* => void', [
        animate(1000, style({transform: 'translateY(-100%)', opacity: 0}))
      ])
    ])
  ]
})
export class ChatComponent implements OnInit {

  chatMessages: ChatMessage[] = [];
  newChatMessages: ChatMessage[] = [];

  @ViewChild('chat') chatElement : ElementRef;

  constructor() { }

  ngOnInit() {
  }

  addMessage(message: ChatMessage) {
    this.chatMessages.push(message);
    this.newChatMessages.push(message);
    setTimeout(() => {
      this.newChatMessages.splice(this.newChatMessages.indexOf(message), 1);
    }, 5000);
  }

}
