import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DrawingBoardDirective} from "../drawing-board.directive";

export class Point {
  x: number;
  y: number;
}

export class Path {
  color = '#4bf';
  size = 5;
  points: Point[] = [];
}

export class ViewPort {
  width: number;
  height: number;
  start: Point;
}

@Component({
  selector: 'app-drawing-board',
  templateUrl: './drawing-board.component.html',
  styleUrls: ['./drawing-board.component.css']
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

  constructor() {
    this.newPath = new EventEmitter<Path>();
  }

  ngOnInit(): void {
  }

  pathDrawn(path: Path): void {
    this.tempBoard.reset();
    path.points = this.reducePoints(path.points);
    this.newPath.next(path);
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
}
