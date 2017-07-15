import {Directive, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';

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
  zoom: number;
  start: Point;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.zoom = 1;
    this.start = {x: 0, y: 0};
  }

  zoomBy(by: number): void {
    this.zoom = this.zoom * by;
    this.height = this.height * by;
    this.width = this.width * by;
    //this.redraw();
  }

  move(up: number, right: number): void {
    this.start.x = this.start.x + right;
    this.start.y = this.start.y + up;
    //this.redraw();
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    //this.redraw();
  }
}


@Directive({
  selector: '[appDrawingBoard]',
  exportAs: 'appDrawingBoard'
})
export class DrawingBoardDirective implements OnInit {


  @Input() drawingColor = '#4bf';
  @Input() drawingSize = 5;
  @Input() drawingDisabled = false;

  @Input() drawingHeight = 600;
  @Input() drawingWidth = 800;

  @Output() newPath: EventEmitter<Path>;

  @Input() viewPort; //: ViewPort = new ViewPort(800, 600);


  private ctx;
  private element;
  private paths: Path[] = [];
  private currentPath: Path = null;

  constructor(private el: ElementRef) {
    this.newPath = new EventEmitter<Path>();
    this.element = el.nativeElement;
    this.ctx = this.element.getContext('2d');
  }

  ngOnInit(): void {
    if (!this.drawingDisabled) {
      let lastX: number;
      let lastY: number;
      this.element.addEventListener('mousedown', (event) => {
        if (!this.drawingDisabled) {
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
        if (!this.drawingDisabled && this.currentPath) {
          // get current mouse position
          let currentX, currentY;
          if (event.offsetX !== undefined) {
            currentX = event.offsetX;
            currentY = event.offsetY;
          } else {
            currentX = event.layerX - event.currentTarget.offsetLeft;
            currentY = event.layerY - event.currentTarget.offsetTop;
          }

          this.draw(currentX, currentY);

          // set current coordinates to last one
          lastX = currentX;
          lastY = currentY;
        }
      });
      this.element.addEventListener('mouseup', (event) => {
        // stop drawing
        if (!this.drawingDisabled) {
          this.newPath.next(this.currentPath);
          this.currentPath = null;
          this.redraw();
        }
      });
    }
  }

  private midPointBtw(p1: Point, p2: Point): Point {
    return {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2
    };
  }

  private beginDrawing(x: number, y: number): void {
    console.log("wtf", this.viewPort);
    this.currentPath = new Path();
    this.currentPath.color = this.drawingColor;
    this.currentPath.size = this.drawingSize;
    let cp = { x: x, y: y };
    console.log(cp);
    let p = this.translatePointToViewPort(cp);
    console.log(p);
    let cvp = this.translatePointToCanvas(p);
    console.log(cvp);
    this.currentPath.points.push(p);
    this.paths.push(this.currentPath);
  }

  private draw(cX, cY): void {
    this.currentPath.points.push(this.translatePointToViewPort({ x: cX, y: cY }));
    this.redraw();

    // line from
    // this.ctx.moveTo(lX, lY);
    // to
    // this.ctx.lineTo(cX, cY);
    // this.ctx.stroke();
  }

  redraw(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.paths.forEach(path => {
      const points = path.points.map((p: Point) => this.translatePointToCanvas(p));
      this.ctx.lineWidth = path.size * this.viewPort.zoom;
      this.ctx.lineJoin = this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = path.color;
      let p1 = points[0];
      let p2 = points[1];

      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      for (let i = 1; i < points.length; i++) {
        const midPoint = this.midPointBtw(p1, p2);
        this.ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        p1 = points[i];
        p2 = points[i + 1];
      }
      this.ctx.lineTo(p1.x, p1.y);
      this.ctx.stroke();
    });
  }


  //translatePoint(point: Point): Point {
    //// 800x600 (width x height)
    //// viewport   canvas
    //// 0, 0       0, 600
    //// 800, 0     800, 600
    //// 0, 600     0, 0
    //// 800, 600   800, 0
    //// x rovnake
    //// cy = vp.h - vpy
    //// vpy = vp.h - cy

  //}

  translatePointToCanvas(point: Point) {
    let newPoint = new Point();
    newPoint.x = (point.x - (this.viewPort.start.x)) * this.viewPort.zoom;
    newPoint.y = ((point.y + (this.viewPort.start.y)) * this.viewPort.zoom);
    return newPoint;
  }

  translatePointToViewPort(point: Point) {
    let newPoint = new Point();
    newPoint.x = (point.x / this.viewPort.zoom) + (this.viewPort.start.x);
    newPoint.y = ((point.y / this.viewPort.zoom) - (this.viewPort.start.y));
    return newPoint;
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

  zoom(by: number): void {
    this.viewPort.zoom = this.viewPort.zoom * by;
    this.redraw();
  }

  move(up: number, right: number): void {
    this.viewPort.start.x = this.viewPort.start.x + right;
    this.viewPort.start.y = this.viewPort.start.y + up;
    this.redraw();
  }

  resize(width: number, height: number): void {
    this.viewPort.width = width;
    this.viewPort.height = height;
    this.redraw();
  }
}
