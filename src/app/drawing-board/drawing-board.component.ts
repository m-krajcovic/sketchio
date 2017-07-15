import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DrawingBoardDirective} from "../drawing-board.directive";
import {Path} from "../drawing-board.directive";
import {Point} from "../drawing-board.directive";
import {ViewPort} from "../drawing-board.directive";


@Component({
  selector: 'app-drawing-board',
  templateUrl: './drawing-board.component.html',
  styleUrls: ['./drawing-board.component.css'],
  //directives: [DrawingBoardDirective],
})
export class DrawingBoardComponent implements OnInit {

  @Output() newPath: EventEmitter<Path>;

  @Input() drawingColor = '#4bf';
  @Input() drawingSize = 5;
  @Input() drawingDisabled = false;

  @Input() drawingHeight = 600;
  @Input() drawingWidth = 800;

  @ViewChild('tempBoard') tempBoard: DrawingBoardDirective;
  @ViewChild('persistentBoard') persistentBoard: DrawingBoardDirective;

  viewPort: ViewPort = new ViewPort(800, 600);

  constructor() {
    this.newPath = new EventEmitter<Path>();
  }

  ngOnInit(): void {
    this.tempBoard.viewPort = this.viewPort;
    this.persistentBoard.viewPort = this.viewPort;
  }

  pathDrawn(path: Path): void {
    this.tempBoard.reset();
    path.points = this.reducePoints(path.points);
    this.newPath.next(path);
    console.log(path);
    this.persistentBoard.addPath(path);
  }

  private reducePoints(points: Point[]): Point[] {
    const newPoints: Point[] = [];
    if (points.length) {
      newPoints.push(points[0]);
      let distance = 0;
      for (let i = 1; i < points.length - 1; i++) {
        distance += this.distance(points[i - 1], points[i]);
        if (distance > 10) {
          distance = 0;
          newPoints.push(points[i]);
        }
      }
      newPoints.push(points[points.length - 1]);
    }
    return newPoints;
  }

  private distance(point1: Point, point2: Point): number {
    return Math.hypot(point1.x - point2.x, point1.y - point2.y);
  }


  reset(): void {
    this.persistentBoard.reset();
  }

  undo(): void {
    this.persistentBoard.undo();
  }

  addPath(path: Path): void {
    this.persistentBoard.addPath(path);
  }

  zoomIn() {
    this.viewPort.zoomBy(2);
    this.persistentBoard.redraw();
    this.tempBoard.redraw();
    //this.persistentBoard.zoom(2);
    //this.tempBoard.zoom(2);
  }

  zoomOut() {
    this.viewPort.zoomBy(0.5);
    this.persistentBoard.redraw();
    this.tempBoard.redraw();
    //this.persistentBoard.zoom(0.5);
    //this.tempBoard.zoom(0.5);
  }

  moveUp() {
    this.viewPort.move(10, 0);
    this.persistentBoard.redraw();
    this.tempBoard.redraw();
    //this.tempBoard.move(10, 0);
  }
  moveDown() {
    this.viewPort.move(-10, 0);
    this.persistentBoard.redraw();
    this.tempBoard.redraw();
    //this.persistentBoard.move(-10, 0);
    //this.tempBoard.move(-10, 0);
  }
  moveRight() {
    this.viewPort.move(0, 10);
    this.persistentBoard.redraw();
    this.tempBoard.redraw();
    //this.persistentBoard.move(0, 10);
    //this.tempBoard.move(0, 10);
  }
  moveLeft() {
    this.viewPort.move(0, -10);
    this.persistentBoard.redraw();
    this.tempBoard.redraw();
    //this.persistentBoard.move(0, -10);
    //this.tempBoard.move(0, -10);
  }
  resize() {
    //this.persistentBoard.resize(this.drawingWidth, this.drawingHeight);
    //this.tempBoard.resize(this.drawingWidth, this.drawingHeight);
  }
}
