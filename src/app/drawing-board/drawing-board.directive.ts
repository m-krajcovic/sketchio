import {Directive, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MoveTool, PencilTool, Tool, ToolData, ToolType} from './tools';
import {Point, ViewPort} from './models';

@Directive({
  selector: '[appDrawingBoard]',
  exportAs: 'appDrawingBoard'
})
export class DrawingBoardDirective implements OnInit {

  @Input() drawingColor = '#4bf';
  @Input() drawingSize = 5;
  @Input() drawingDisabled = false;


  @Input() viewPort: ViewPort = new ViewPort();
  @Input() currentTool: Tool;
  @Input() private drawGrid: boolean = false;

  @Output() newToolData: EventEmitter<ToolData>;
  @Output() newCommand: EventEmitter<string>;

  private _drawingHeight = 600;
  private _drawingWidth = 800;

  ctx: any;
  private element: any;
  private drawingToolData: ToolData[] = [];
  private currentToolData: ToolData = null;

  private tools;
  private commands = {
    'undo': this.undo.bind(this),
    'reset': this.reset.bind(this),
  };

  constructor(private el: ElementRef) {
    this.newToolData = new EventEmitter<ToolData>();
    this.newCommand = new EventEmitter<string>();
    this.element = el.nativeElement;
    this.ctx = this.element.getContext('2d');
  }

  ngOnInit(): void {
    this.element.width = this._drawingWidth;
    this.element.height = this._drawingHeight;
    this.tools = {
      'pencil': new PencilTool(this),
      'move': new MoveTool(this),
    };
    this.currentTool = this.tools['pencil'];
    this.viewPort.change.subscribe(() => this.redraw());
    if (!this.drawingDisabled) {
      const last: Point = new Point();
      let lastTool: Tool = null;
      this.element.addEventListener('mousedown', (event) => {
        if (!this.drawingDisabled) {
          if (event.offsetX !== undefined) {
            last.x = event.offsetX;
            last.y = event.offsetY;
          } else { // Firefox compatibility
            last.x = event.layerX - event.currentTarget.offsetLeft;
            last.y = event.layerY - event.currentTarget.offsetTop;
          }
          if (event.button === 1) {
            lastTool = this.currentTool;
            this.selectTool('move');
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
      this.element.addEventListener('mouseenter', (event) => {
        if (!this.drawingDisabled && event.which === 1) {
          if (event.offsetX !== undefined) {
            last.x = event.offsetX;
            last.y = event.offsetY;
          } else { // Firefox compatibility
            last.x = event.layerX - event.currentTarget.offsetLeft;
            last.y = event.layerY - event.currentTarget.offsetTop;
          }
          if (event.button === 1) {
            lastTool = this.currentTool;
            this.selectTool('move');
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
      this.element.addEventListener('mousemove', (event) => {
        if (!this.drawingDisabled && (this.currentToolData)) {
          let currentX, currentY;
          if (event.offsetX !== undefined) {
            currentX = event.offsetX;
            currentY = event.offsetY;
          } else {
            currentX = event.layerX - event.currentTarget.offsetLeft;
            currentY = event.layerY - event.currentTarget.offsetTop;
          }

          this.currentTool.mouseMove(new Point(currentX, currentY), last);
          last.x = currentX;
          last.y = currentY;
        }
      });
      this.element.addEventListener('mouseup', (event) => {
        if (!this.drawingDisabled && (this.currentToolData)) {
          this.currentTool.mouseUp();
          if (this.currentToolData && this.currentToolData.toolType === ToolType.drawing) {
            this.newToolData.next(this.currentToolData);
          }
          this.currentToolData = null;
          if (event.button === 1) {
            this.currentTool = lastTool;
          }
        }
      });
      this.element.addEventListener('mouseleave', (event) => {
        if (!this.drawingDisabled && (this.currentToolData)) {
          this.currentTool.mouseUp();
          if (this.currentToolData && this.currentToolData.toolType === ToolType.drawing) {
            this.newToolData.next(this.currentToolData);
          }
          this.currentToolData = null;
          if (event.button === 1) {
            this.currentTool = lastTool;
          }
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
          if (event.deltaY !== 0) {
            if (event.deltaY > 0) {
              const vpPoint = this.viewPort.translatePointToViewPort(new Point(currentX, currentY));
              this.viewPort.zoomBy(0.9);
              const afterPoint = this.viewPort.translatePointToCanvas(vpPoint);
              this.viewPort.moveBy(
                (afterPoint.y - currentY) / this.viewPort.zoom,
                (afterPoint.x - currentX) / this.viewPort.zoom);
            } else if (event.deltaY < 0) {
              const vpPoint = this.viewPort.translatePointToViewPort(new Point(currentX, currentY));
              this.viewPort.zoomBy(1.1);
              const afterPoint = this.viewPort.translatePointToCanvas(vpPoint);
              this.viewPort.moveBy(
                (afterPoint.y - currentY) / this.viewPort.zoom,
                (afterPoint.x - currentX) / this.viewPort.zoom);
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
    this.redraw();
  }

  @Input()
  set drawingHeight(value) {
    this._drawingHeight = value;
    this.redraw();
  }

  @Input()
  set drawingWidth(value) {
    this._drawingWidth = value;
    this.redraw();
  }
  redraw(): void {
    this.element.width = this._drawingWidth;
    this.element.height = this._drawingHeight;
    this.drawingToolData.forEach(toolPath => {
      const tool = this.tools[toolPath.tool];
      tool.draw(toolPath.data);
    });
    if (this.drawGrid) {
      const startX = this.viewPort.start.x;
      const startY = this.viewPort.start.y;
      console.log(this.viewPort.zoom);
      let step = 50;
      if (this.viewPort.zoom >= 0.5) {
        step = 50;
        let zoom = 2.5;
        while (this.viewPort.zoom >= zoom) {
          zoom = zoom * 5;
          step = step / 10;
        }
      } else {
        step = 500;
        let zoom = 0.1;
        while (this.viewPort.zoom <= zoom) {
          zoom = zoom / 5;
          step = step * 10;
        }
      }
      for (let x = startX - (startX % step); x < startX + (this._drawingWidth / this.viewPort.zoom); x += step) {
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = x % (step * 10) === 0 ? 1 : 0.2;
        this.ctx.strokeStyle = "#000000";
        this.ctx.beginPath();
        let canvasX = this.viewPort.translateXToCanvas(x);
        this.ctx.moveTo(canvasX, 0);
        this.ctx.lineTo(canvasX, this._drawingHeight);
        this.ctx.stroke();
      }
      for (let y = startY - (startY % step); y < startY + (this._drawingHeight / this.viewPort.zoom); y += step) {
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = y % (step * 10) === 0 ? 1 : 0.2;
        this.ctx.strokeStyle = "#000000";
        this.ctx.beginPath();
        let canvasY = this.viewPort.translateYToCanvas(y);
        this.ctx.moveTo(0, canvasY);
        this.ctx.lineTo(this._drawingWidth, canvasY);
        this.ctx.stroke();
      }
    }
    this.ctx.globalAlpha = 1;
  }

  addToolData(toolData: ToolData): void {
      this.drawingToolData.push(toolData);
      this.redraw();
  }

  applyCommand(command: string) {
    this.commands[command]();
  }

  applyUndo(): void {
    this.undo();
    this.newCommand.next('undo');
  }

  applyReset(): void {
    this.reset();
    this.newCommand.next('reset');
  }

  private reset(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawingToolData = [];
    this.currentToolData = null;
    this.redraw();
  }

  private undo(): void {
    this.drawingToolData.splice(this.drawingToolData.length - 1, 1);
    this.redraw();
  }

  selectTool(tool: string): Tool {
    const selectedTool = this.tools[tool];
    if (selectedTool) {
      this.currentTool = selectedTool;
    }
    return this.currentTool;
  }
}
