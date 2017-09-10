import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DrawingBoardDirective} from './drawing-board.directive';
import {ToolData} from './tools';
import {ViewPort} from './models';

@Component({
  selector: 'app-drawing-board',
  templateUrl: './drawing-board.component.html',
  styleUrls: ['./drawing-board.component.css'],
})
export class DrawingBoardComponent implements OnInit {

  @Output() newToolData: EventEmitter<ToolData>;
  @Output() newDrawingCommand: EventEmitter<string>;
  @Output() viewPortChange: EventEmitter<ViewPort>;

  @Input() drawingColor = '#44bbff';
  @Input() drawingSize = 5;
  @Input() drawingDisabled = false;

  @Input() drawingHeight = 600;
  @Input() drawingWidth = 800;

  @ViewChild('tempBoard') tempBoard: DrawingBoardDirective;
  @ViewChild('persistentBoard') persistentBoard: DrawingBoardDirective;

  @ViewChild('toolsWrapper') toolsWrapper: ElementRef;
  @ViewChild('toolsGrabber') toolsGrabber: ElementRef;

  viewPort: ViewPort = new ViewPort();

  moving = false;

  constructor() {
    this.newToolData = new EventEmitter<ToolData>();
    this.viewPortChange = new EventEmitter<ViewPort>();
    this.newDrawingCommand = new EventEmitter<string>();
  }

  ngOnInit(): void {
    this.viewPort.changeCommit.subscribe((viewPort) => {
      this.viewPortChange.next(viewPort);
    });
    this.persistentBoard.newCommand.subscribe(command => this.newDrawingCommand.next(command));



    let moving = false;
    let offset = [0, 0];
    this.toolsGrabber.nativeElement.addEventListener('click', (event) => {
      if (event.detail === 2) {
        this.toolsWrapper.nativeElement.classList.toggle('vertical');
      }
    });
    this.toolsGrabber.nativeElement.addEventListener('mousedown', (event) => {
      moving = true;
      offset = [
        this.toolsWrapper.nativeElement.offsetLeft - event.clientX,
        this.toolsWrapper.nativeElement.offsetTop - event.clientY
      ];
      this.tempBoard.drawingDisabled = true;
    }, true);
    document.addEventListener('mousemove', (event) => {
      if (moving) {
        event.preventDefault();
        event.stopPropagation();
        let mousePosition = [event.clientX, event.clientY];
        this.toolsWrapper.nativeElement.style.left = (mousePosition[0] + offset[0]) + 'px';
        this.toolsWrapper.nativeElement.style.top  = (mousePosition[1] + offset[1]) + 'px';
      }
    }, true);
    document.addEventListener('mouseup', (event) => {
      moving = false;
      this.tempBoard.drawingDisabled = false;
    }, true);
  }

  toolDataAdded(path: ToolData): void {
    this.tempBoard.applyReset();
    this.newToolData.next(path);
    this.persistentBoard.addToolData(path);
  }

  changeViewPort(viewPort: ViewPort) {
    this.viewPort.changeTo(viewPort);
  }

  reset(): void {
    this.persistentBoard.applyReset();
  }

  undo(): void {
    this.persistentBoard.applyUndo();
  }

  addToolData(path: ToolData): void {
    this.persistentBoard.addToolData(path);
  }

  applyDrawingCommand(command: string) {
    this.persistentBoard.applyCommand(command);
  }

  toggleMovingTool() {
    if (this.moving) {
      this.tempBoard.selectTool('move');
    } else {
      this.tempBoard.selectTool('pencil');
    }
  }

  get toolData(): ToolData[] {
    return this.persistentBoard.drawingToolData;
  }

  set toolData(value) {
    this.persistentBoard.drawingToolData = value;
    this.persistentBoard.redraw();
  }
}
