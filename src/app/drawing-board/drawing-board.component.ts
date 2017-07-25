import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DrawingBoardDirective} from "../drawing-board.directive";
import {Path} from "../drawing-board.directive";
import {Point} from "../drawing-board.directive";
import {ViewPort} from "../drawing-board.directive";
import {ToolData} from "../drawing-board.directive";


@Component({
  selector: 'app-drawing-board',
  templateUrl: './drawing-board.component.html',
  styleUrls: ['./drawing-board.component.css'],
  //directives: [DrawingBoardDirective],
})
export class DrawingBoardComponent implements OnInit {

  @Output() newToolData: EventEmitter<ToolData>;
  @Output() viewPortChange: EventEmitter<ViewPort>;

  @Input() drawingColor = '#44bbff';
  @Input() drawingSize = 5;
  @Input() drawingDisabled = false;

  @Input() drawingHeight = 600;
  @Input() drawingWidth = 800;

  @ViewChild('tempBoard') tempBoard: DrawingBoardDirective;
  @ViewChild('persistentBoard') persistentBoard: DrawingBoardDirective;

  viewPort: ViewPort = new ViewPort(800, 600);

  moving: boolean = false;

  constructor() {
    this.newToolData = new EventEmitter<ToolData>();
    this.viewPortChange = new EventEmitter<ViewPort>();
  }

  ngOnInit(): void {
    this.viewPort.changeCommit.subscribe((viewPort) => {
      this.viewPortChange.next(viewPort);
    });
  }

  toolDataAdded(path: ToolData): void {
    //console.log(path);
    this.tempBoard.reset();
    this.newToolData.next(path);
    this.persistentBoard.addToolData(path);
  }

  changeViewPort(viewPort: ViewPort) {
    this.viewPort.changeTo(viewPort);
  }

  reset(): void {
    this.persistentBoard.reset();
  }

  undo(): void {
    this.persistentBoard.undo();
  }

  addToolData(path: ToolData): void {
    this.persistentBoard.addToolData(path);
  }

  zoomIn() {
    this.viewPort.zoomBy(2);
  }

  zoomOut() {
    this.viewPort.zoomBy(0.5);
  }

  moveUp() {
    this.viewPort.moveBy(-10, 0);
  }
  moveDown() {
    this.viewPort.moveBy(10, 0);
  }
  moveRight() {
    this.viewPort.moveBy(0, 10);
  }
  moveLeft() {
    this.viewPort.moveBy(0, -10);
  }
  resize() {
    this.viewPort.resize(this.drawingWidth, this.drawingHeight);
  }

  toggleMovingTool() {
    if (this.moving) {
      this.tempBoard.selectTool('move');
    } else {
      this.tempBoard.selectTool('pencil');
    }
  }
}
