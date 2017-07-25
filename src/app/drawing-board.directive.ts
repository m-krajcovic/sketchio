import {Directive, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';

export class Point {
  x:number;
  y:number;


  constructor(x:number = 0, y:number = 0) {
    this.x = x;
    this.y = y;
  }

  distance(point2:Point):number {
    return Math.hypot(this.x - point2.x, this.y - point2.y);
  }
}

export class Path {
  color = '#4bf';
  size = 5;
  points:Point[] = [];
}

export class ViewPort {

  change:EventEmitter<any>;
  changeCommit:EventEmitter<ViewPort>;

  width:number;
  height:number;
  zoom:number;
  start:Point;

  constructor(width:number, height:number) {
    this.width = width;
    this.height = height;
    this.zoom = 1;
    this.start = new Point(0, 0);

    this.change = new EventEmitter<any>();
    this.changeCommit = new EventEmitter<ViewPort>();
  }

  zoomBy(by:number):void {
    this.zoom = this.zoom * by;
    this.change.next();
    //this.redraw();
  }

  moveBy(up:number, right:number):void {
    this.start.x = this.start.x + right;
    this.start.y = this.start.y + up;
    this.change.next();
    //this.redraw();
  }

  resize(width:number, height:number):void {
    this.width = width;
    this.height = height;
    this.change.next();
    //this.redraw();
  }

  moveTo(point:Point):void {
    this.start.x = point.x;
    this.start.y = point.y;
    this.change.next();
  }


  translatePointToCanvas(point:Point) {
    let newPoint = new Point();
    newPoint.x = (point.x - (this.start.x)) * this.zoom;
    newPoint.y = ((point.y - (this.start.y)) * this.zoom);
    return newPoint;
  }

  translatePointToViewPort(point:Point) {
    let newPoint = new Point();
    newPoint.x = (point.x / this.zoom) + (this.start.x);
    newPoint.y = ((point.y / this.zoom) + (this.start.y));
    return newPoint;
  }

  commitChange():void {
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

export interface Tool {
  getName(): string;
  getType(): ToolType;
  //selectTool();
  mouseDown(last:Point): any;
  mouseMove(current:Point, last:Point);
  mouseUp();
  wheel(event);
  //draw(data);
}

export interface DrawingTool extends Tool {

  draw(data);
}

export enum ToolType {
  drawing, command
}

export class ToolData {
  tool:string;
  toolType: ToolType;
  data:any;
}

export class PencilTool implements DrawingTool {

  currentPath:Path;
  viewPort:ViewPort;
  drawingBoard:DrawingBoardDirective;
  ctx:any;

  constructor(drawingBoard:DrawingBoardDirective) {
    this.drawingBoard = drawingBoard;
    this.ctx = drawingBoard.ctx;
    this.viewPort = drawingBoard.viewPort;
  }

  getName() {
    return "pencil";
  }

  getType(): ToolType {
    return ToolType.drawing;
  }

  selectTool() {
  }

  mouseDown(current:Point):any {
    this.currentPath = new Path();
    this.currentPath.color = this.drawingBoard.drawingColor;
    this.currentPath.size = this.drawingBoard.drawingSize;
    let p = this.viewPort.translatePointToViewPort(current);
    this.currentPath.points.push(p);
    return this.currentPath;
    //this.paths.push(this.currentPath);
  }

  mouseMove(current:Point, last:Point) {
    if (this.currentPath) {
      this.currentPath.points.push(this.viewPort.translatePointToViewPort(current));
      this.drawingBoard.redraw();
    }
  }

  mouseUp() {
    this.currentPath.points = this.reducePoints(this.currentPath.points);
    this.currentPath = null;
    this.drawingBoard.redraw();
  }

  wheel(event) {
  }

  private reducePoints(points:Point[]):Point[] {
    const newPoints:Point[] = [];
    if (points.length) {
      newPoints.push(points[0]);
      let distance = 0;
      let maxDistance = 10 / this.viewPort.zoom;
      for (let i = 1; i < points.length - 1; i++) {
        distance += points[i - 1].distance(points[i]);
        if (distance > maxDistance) {
          distance = 0;
          newPoints.push(points[i]);
        }
      }
      newPoints.push(points[points.length - 1]);
    }
    return newPoints;
  }

  draw(data) {
    const points = data.points.map((p:Point) => this.viewPort.translatePointToCanvas(p));
    this.ctx.lineWidth = data.size * this.viewPort.zoom;
    this.ctx.lineJoin = this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = data.color;
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
  }

  private midPointBtw(p1:Point, p2:Point):Point {
    return new Point(
      p1.x + (p2.x - p1.x) / 2,
      p1.y + (p2.y - p1.y) / 2
    );
  }

}

export class MoveTool implements Tool {

  viewPort:ViewPort;

  finish:Point;

  constructor(drawingBoard:DrawingBoardDirective) {
    this.viewPort = drawingBoard.viewPort;
  }

  getType() {
    return ToolType.command;
  }

  getName() {
    return "move";
  }

  selectTool() {
  }

  mouseDown(last:Point):any {
    this.finish = new Point();
    return this.finish;
  }

  mouseMove(current:Point, last:Point) {
    this.viewPort.moveBy((last.y - current.y) / this.viewPort.zoom, (last.x - current.x) / this.viewPort.zoom);
  }

  mouseUp() {
    this.finish.x = this.viewPort.start.x;
    this.finish.y = this.viewPort.start.y;

    this.viewPort.commitChange();
    // commit viewport change
  }

  wheel(event) {
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

  @Output() newToolData:EventEmitter<ToolData>;

  @Input() viewPort:ViewPort = new ViewPort(800, 600);
  @Input() currentTool:Tool;

  ctx;

  private element;
  private drawingToolData:ToolData[] = [];
  private currentToolData:ToolData = null;
  private tools;

  constructor(private el:ElementRef) {
    this.newToolData = new EventEmitter<ToolData>();
    this.element = el.nativeElement;
    this.ctx = this.element.getContext('2d');
  }

  ngOnInit():void {
    this.tools = {
      'pencil': new PencilTool(this),
      'move': new MoveTool(this),
    };
    this.currentTool = this.tools['pencil'];
    this.viewPort.change.subscribe(() => this.redraw());
    if (!this.drawingDisabled) {
      let last:Point = new Point();
      this.element.addEventListener('mousedown', (event) => {
        if (!this.drawingDisabled) {
          if (event.offsetX !== undefined) {
            last.x = event.offsetX;
            last.y = event.offsetY;
          } else { // Firefox compatibility
            last.x = event.layerX - event.currentTarget.offsetLeft;
            last.y = event.layerY - event.currentTarget.offsetTop;
          }

          this.currentToolData = new ToolData();
          this.currentToolData.tool = this.currentTool.getName();
          this.currentToolData.toolType = this.currentTool.getType();
          this.currentToolData.data = this.currentTool.mouseDown(new Point(last.x, last.y));
          if (this.currentToolData.toolType === ToolType.drawing) {
            this.drawingToolData.push(this.currentToolData);
          }
        }
      });
      let moveCommitHandle = null;
      this.element.addEventListener('mousemove', (event) => {
        if (!this.drawingDisabled && this.currentToolData) {
          let currentX, currentY;
          if (event.offsetX !== undefined) {
            currentX = event.offsetX;
            currentY = event.offsetY;
          } else {
            currentX = event.layerX - event.currentTarget.offsetLeft;
            currentY = event.layerY - event.currentTarget.offsetTop;
          }

          if (event.button === 1) {
            // move around on wheel click
            this.viewPort.moveBy((last.y - currentY) / this.viewPort.zoom, (last.x - currentX) / this.viewPort.zoom);

            clearTimeout(moveCommitHandle);
            moveCommitHandle = setTimeout(() => {
              // commit viewport change
              this.viewPort.commitChange();
              moveCommitHandle = null;
            }, 250);
          } else {
            this.currentTool.mouseMove(new Point(currentX, currentY), last);
          }

          // set current coordinates to last one
          last.x = currentX;
          last.y = currentY;
          //}
        }
      });
      this.element.addEventListener('mouseup', (event) => {
        if (!this.drawingDisabled) {
          this.currentTool.mouseUp();
          if (this.currentToolData && this.currentToolData.toolType === ToolType.drawing) {
            this.newToolData.next(this.currentToolData);
          }
          this.currentToolData = null;
        }
      });
      let zoomCommitHandle = null;
      this.element.addEventListener('wheel', (event) => {
        if (!this.drawingDisabled) {
          let currentX, currentY;
          if (event.offsetX !== undefined) {
            currentX = event.offsetX;
            currentY = event.offsetY;
          } else {
            currentX = event.layerX - event.currentTarget.offsetLeft;
            currentY = event.layerY - event.currentTarget.offsetTop;
          }

          // zoom on scroll, doesn't matter which tool
          if (event.deltaY != 0) {
            if (event.deltaY > 0) {
              var vpPoint = this.viewPort.translatePointToViewPort(new Point(currentX, currentY));
              this.viewPort.zoomBy(1.05);
              var afterPoint = this.viewPort.translatePointToCanvas(vpPoint);
              this.viewPort.moveBy((afterPoint.y - currentY) / this.viewPort.zoom, (afterPoint.x - currentX) / this.viewPort.zoom /*- afterPoint.x*/);
            } else if (event.deltaY < 0) {
              var vpPoint = this.viewPort.translatePointToViewPort(new Point(currentX, currentY));
              this.viewPort.zoomBy(0.95);
              var afterPoint = this.viewPort.translatePointToCanvas(vpPoint);
              this.viewPort.moveBy((afterPoint.y - currentY) / this.viewPort.zoom, (afterPoint.x - currentX) / this.viewPort.zoom /*- afterPoint.x*/);
            }
            clearTimeout(zoomCommitHandle);
            zoomCommitHandle = setTimeout(() => {
              // commit viewport change
              this.viewPort.commitChange();
              zoomCommitHandle = null;
            }, 250);
          }
        }
      });
    }
  }

  redraw():void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawingToolData.forEach(toolPath => {
      let tool = this.tools[toolPath.tool];
      tool.draw(toolPath.data);
    });
  }

  reset():void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawingToolData = [];
    this.currentToolData = null;
  }

  addToolData(toolData:ToolData):void {
      this.drawingToolData.push(toolData);
      this.redraw();
  }

  undo() {
    this.drawingToolData.splice(this.drawingToolData.length - 1, 1);
    this.redraw();
  }

  selectTool(tool:string) {
    let selectedTool = this.tools[tool];
    if (selectedTool) {
      this.currentTool = selectedTool;
    }
  }
}
