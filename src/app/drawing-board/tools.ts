import {Path, Point, ViewPort} from './models';
import {DrawingBoardDirective} from './drawing-board.directive';

export interface Tool {
  getName(): string;
  getType(): ToolType;
  // selectTool();
  mouseDown(last: Point): any;
  mouseMove(current: Point, last: Point);
  mouseUp();
  wheel(event);
  // draw(data);
}

export interface DrawingTool extends Tool {

  draw(data);
}

export enum ToolType {
  drawing, command
}

export class ToolData {
  tool: string;
  toolType: ToolType;
  data: any;
}

export class PencilTool implements DrawingTool {

  currentPath: Path;
  viewPort: ViewPort;
  drawingBoard: DrawingBoardDirective;
  ctx: any;

  constructor(drawingBoard: DrawingBoardDirective) {
    this.drawingBoard = drawingBoard;
    this.ctx = drawingBoard.ctx;
    this.viewPort = drawingBoard.viewPort;
  }

  getName() {
    return 'pencil';
  }

  getType(): ToolType {
    return ToolType.drawing;
  }

  selectTool() {
  }

  mouseDown(current: Point): any {
    this.currentPath = new Path();
    this.currentPath.color = this.drawingBoard.drawingColor;
    this.currentPath.size = this.drawingBoard.drawingSize;
    const p = this.viewPort.translatePointToViewPort(current);
    this.currentPath.points.push(p);
    return this.currentPath;
    // this.paths.push(this.currentPath);
  }

  mouseMove(current: Point, last: Point) {
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

  private reducePoints(points: Point[]): Point[] {
    const newPoints: Point[] = [];
    if (points.length) {
      newPoints.push(points[0]);
      let distance = 0;
      const maxDistance = 10 / this.viewPort.zoom;
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
    const points = data.points.map((p: Point) => this.viewPort.translatePointToCanvas(p));
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

  private midPointBtw(p1: Point, p2: Point): Point {
    return new Point(
      p1.x + (p2.x - p1.x) / 2,
      p1.y + (p2.y - p1.y) / 2
    );
  }

}

export class MoveTool implements Tool {

  viewPort: ViewPort;

  finish: Point;

  constructor(drawingBoard: DrawingBoardDirective) {
    this.viewPort = drawingBoard.viewPort;
  }

  getType() {
    return ToolType.command;
  }

  getName() {
    return 'move';
  }

  selectTool() {
  }

  mouseDown(last: Point): any {
    this.finish = new Point();
    return this.finish;
  }

  mouseMove(current: Point, last: Point) {
    this.viewPort.moveBy((last.y - current.y) / this.viewPort.zoom, (last.x - current.x) / this.viewPort.zoom);
  }

  mouseUp() {
    // this.finish.x = this.viewPort.start.x;
    // this.finish.y = this.viewPort.start.y;

    this.viewPort.commitChange();
    // commit viewport change
  }

  wheel(event) {
  }
}
