import {EventEmitter} from '@angular/core';

export class Point {
  x: number;
  y: number;


  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  distance(point2: Point): number {
    return Math.hypot(this.x - point2.x, this.y - point2.y);
  }
}

export class Path {
  color = '#4bf';
  size = 5;
  points: Point[] = [];
}

export class ViewPort {

  change: EventEmitter<any>;
  changeCommit: EventEmitter<ViewPort>;

  width: number;
  height: number;
  zoom: number;
  start: Point;

  constructor() {
    // this.width = width;
    // this.height = height;
    this.zoom = 1;
    this.start = new Point(0, 0);

    this.change = new EventEmitter<any>();
    this.changeCommit = new EventEmitter<ViewPort>();
  }

  zoomBy(by: number): void {
    this.zoom = this.zoom * by;
    this.change.next();
    // this.redraw();
  }

  moveBy(up: number, right: number): void {
    this.start.x = this.start.x + right;
    this.start.y = this.start.y + up;
    this.change.next();
    // this.redraw();
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.change.next();
    // this.redraw();
  }

  moveTo(point: Point): void {
    this.start.x = point.x;
    this.start.y = point.y;
    this.change.next();
  }


  translateXToCanvas(x: number) {
    return (x - (this.start.x)) * this.zoom;
  }

  translateYToCanvas(y: number) {
    return ((y - (this.start.y)) * this.zoom);
  }

  translatePointToCanvas(point: Point) {
    const newPoint = new Point();
    newPoint.x = (point.x - (this.start.x)) * this.zoom;
    newPoint.y = ((point.y - (this.start.y)) * this.zoom);
    return newPoint;
  }

  translatePointToViewPort(point: Point) {
    const newPoint = new Point();
    newPoint.x = (point.x / this.zoom) + (this.start.x);
    newPoint.y = ((point.y / this.zoom) + (this.start.y));
    return newPoint;
  }

  commitChange(): void {
    this.changeCommit.next(this);
  }

  changeTo(viewPort: ViewPort): void {
    this.width = viewPort.width;
    this.height = viewPort.height;
    this.zoom = viewPort.zoom;
    this.start = viewPort.start;
    this.change.next();
  }
}
