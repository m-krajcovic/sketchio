import { Component, OnInit } from '@angular/core';

export class ChatMessage {
  date: Date;
  playerName: string;
  text: string;
  type: number;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatMessages: ChatMessage[] = [];

  constructor() { }

  ngOnInit() {
  }

  addMessage(message: ChatMessage) {
    this.chatMessages.push(message);
  }

}
