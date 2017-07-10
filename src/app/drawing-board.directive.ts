import {Directive, ElementRef, EventEmitter, Input, Output} from '@angular/core';
import {log} from "util";

export class Point {
  x: number;
  y: number;
}

export class Path {
  color: string = "#4bf";
  size: number = 5;
  points: Point[] = [];
}

@Directive({
  selector: '[drawingBoard]',
  exportAs: 'drawingBoard'
})
export class DrawingBoardDirective {

  @Input('drawingColor') color: string = "#4bf";
  @Input('drawingSize') size: number = 5;
  @Input('drawingDisabled') disabled: boolean = false;

  @Output() newPath: EventEmitter<Path>;

  private ctx;
  private element;
  private paths: Path[] = [];
  private currentPath: Path = null;

  constructor(private el: ElementRef) {
    this.newPath = new EventEmitter<Path>();
    this.element = el.nativeElement;
    this.ctx = this.element.getContext('2d');
    let lastX: number;
    let lastY: number;
    this.element.addEventListener('mousedown', (event) => {
      if (!this.disabled) {
        if (event.offsetX !== undefined) {
          lastX = event.offsetX;
          lastY = event.offsetY;
        } else { // Firefox compatibility
          lastX = event.layerX - event.currentTarget.offsetLeft;
          lastY = event.layerY - event.currentTarget.offsetTop;
        }

        // begins new line
        this.beginDrawing(lastX, lastY);
      }
    });
    this.element.addEventListener('mousemove', (event) => {
      if (!this.disabled && this.currentPath) {
        // get current mouse position
        let currentX, currentY;
        if (event.offsetX !== undefined) {
          currentX = event.offsetX;
          currentY = event.offsetY;
        } else {
          currentX = event.layerX - event.currentTarget.offsetLeft;
          currentY = event.layerY - event.currentTarget.offsetTop;
        }

        this.draw(lastX, lastY, currentX, currentY);

        // set current coordinates to last one
        lastX = currentX;
        lastY = currentY;
      }

    });
    this.element.addEventListener('mouseup', (event) => {
      // stop drawing
      if (!this.disabled) {
        this.currentPath.points = this.reducePoints(this.currentPath.points);
        this.newPath.next(this.currentPath);
        this.currentPath = null;
        this.redraw();
      }
    });
  }

  private midPointBtw(p1: Point, p2: Point): Point {
    return {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2
    };
  }

  private beginDrawing(x: number, y: number): void {
    this.currentPath = new Path();
    console.log(this.color);
    this.currentPath.color = this.color;
    this.currentPath.size = this.size;
    this.currentPath.points.push({x: x, y: y});
    this.paths.push(this.currentPath);
  }

  private reducePoints(points: Point[]): Point[] {
    let newPoints: Point[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      if (i % 8 === 0) {
        newPoints.push(points[i]);
      }
    }
    newPoints.push(points[points.length - 1])
    return newPoints;
  }

  private draw(lX, lY, cX, cY): void {
    this.currentPath.points.push({x: cX, y: cY});
    this.redraw();

    // line from
    // this.ctx.moveTo(lX, lY);
    // to
    // this.ctx.lineTo(cX, cY);
    // this.ctx.stroke();
  }

  private redraw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.paths.forEach(path => {
      let points = path.points;
      this.ctx.lineWidth = path.size;
      this.ctx.lineJoin = this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = path.color;
      let p1 = points[0];
      let p2 = points[1];

      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      for (let i = 1; i < points.length; i++) {
        let midPoint = this.midPointBtw(p1, p2);
        this.ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        p1 = points[i];
        p2 = points[i + 1];
      }
      this.ctx.lineTo(p1.x, p1.y);
      this.ctx.stroke();
    });
  }

  reset(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.paths = [];
    this.currentPath = null;
  }

  addPath(path: Path): void {
    if (path.points.length > 0) {
      this.paths.push(path);
      this.redraw();
    }
  }

  loadPaths(paths: Path[]): void {
    this.reset();
    this.paths = paths;
    this.redraw();
  }

  getPaths(): Path[] {
    return this.paths.slice(0);
  }

  undo() {
    this.paths.splice(this.paths.length - 1, 1);
    this.loadPaths(this.paths);
  }
}
