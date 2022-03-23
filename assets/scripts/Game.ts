import { _decorator, Component, Size, UITransform, v3, Vec3, Node, Touch, Camera, Graphics, EventTouch } from 'cc';
import LineIntersection from './utils/LineIntersection';
const { ccclass, property } = _decorator;

enum Direction {
    LEFT,
    RIGHT,
    UP,
    DOWN
};
@ccclass('main')
export class main extends Component {
    @property({ type: Camera })
    public camera: Camera = null;

    @property({ type: Node })
    public swipeLine: Node = null;

    startPointWorld: Vec3 = v3(0, 0, 0);
    endPointWorld: Vec3 = v3(0, 0, 0);
    tempPointWorld: Vec3 = v3(0, 0, 0);
    swipeDistance: number = 0;
    intersectionPoints: Vec3[] = [];
    touchLastPoint: Vec3 = v3(0, 0, 0);
    points: Vec3[] = [];
    ctx: Graphics = null;
    drawPoints: Vec3[] = [];
    canvasSize: Size = null;
    previousDirection: number;

    lineStartPointWorld: Vec3 = v3(0, 0, 0);
    lineEndPointWorld: Vec3 = v3(0, 0, 0);
    onLoad() {
        this.ctx = this.node.getComponent(Graphics);
        
        this.canvasSize = this.node.getComponent(UITransform).contentSize;
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(event: Touch) {
        var startPoint = v3(event.getLocation().x, event.getLocation().y);
        this.startPointWorld = this.convertToNodeSpace(startPoint);
        this.lineStartPointWorld = this.startPointWorld;
        this.points.push(this.startPointWorld);
        this.drawPoints.push(this.startPointWorld);
        this.touchLastPoint = this.startPointWorld;
    }

    onTouchMove(event: EventTouch) {
        let previousTouchPoint = event.getPreviousLocation();
        let prevTouchPointWorld: Vec3 = this.convertToNodeSpace(v3(previousTouchPoint.x, previousTouchPoint.y));

        let tempPoint = v3(event.getLocation().x, event.getLocation().y);
        this.tempPointWorld = this.convertToNodeSpace(tempPoint);

        this.points.push(this.tempPointWorld);
        this.drawPoints.push(this.tempPointWorld);
        var loc = this.tempPointWorld
        if (this.checkForDirection(loc)) {
            this.swipeDistance = 0;
            this.startPointWorld = loc;
            this.points.length = 0;
            this.points.push(this.tempPointWorld);
        }
        this.touchLastPoint = loc;

        this.swipeDistance += LineIntersection.getDistance(prevTouchPointWorld, this.tempPointWorld);
        if (this.swipeDistance >= 15) {
            this.node.emit("SLICE", this.startPointWorld, this.tempPointWorld);
            this.startPointWorld = this.tempPointWorld;
            this.swipeDistance = 0;
        } else if (this.points.length >= 15) {

            this.node.emit("SLICE", this.points[0], this.points[this.points.length - 1]);
            this.points.length = 0;
        }

        this.ctx.clear();
        this.drawKnife();

    }

    onTouchEnd(event: Touch) {
        var endPoint = v3(event.getLocation().x, event.getLocation().y, 0);
        this.endPointWorld = this.convertToNodeSpace(endPoint);
        // this.drawLine(this.startPointWorld, this.endPointWorld);
        this.node.emit("SLICE", this.startPointWorld, this.endPointWorld);
        this.points.length = 0;
        this.lineEndPointWorld = this.endPointWorld;
        this.drawPoints.length = 0;
    }

    convertToNodeSpace(touchPointWorld: Vec3) {
        var worldTouchPoint = v3(Vec3.ZERO);
        this.camera.camera.screenToWorld(worldTouchPoint, touchPointWorld);
        worldTouchPoint.x = worldTouchPoint.x - (this.canvasSize.width / 2);
        worldTouchPoint.y = worldTouchPoint.y - (this.canvasSize.height / 2);
        return worldTouchPoint;
    }

    checkForDirection(loc: Vec3) {
        let threshold = 25;
        var start = this.startPointWorld;
        let currentDirection: number;
        if (loc.x < start.x - threshold) {
            // if direction changed while swiping left, set new base point
            if (loc.x > this.touchLastPoint.x) {
                start = this.startPointWorld = loc;
            }
            else {
                currentDirection = Direction.LEFT;
            }
        }
        if (loc.x > start.x + threshold) {
            if (loc.x < this.touchLastPoint.x) {
                this.startPointWorld = loc;
            }
            else {
                currentDirection = Direction.RIGHT;
            }
        }
        if (loc.y < start.y - threshold) {
            if (loc.y > this.touchLastPoint.y) {
                this.startPointWorld = loc;
            }
            else {
                currentDirection = Direction.DOWN;
            }
        }
        if (loc.y > start.y + threshold) {
            if (loc.y < this.touchLastPoint.y) {
                this.startPointWorld = loc;
            }
            else {
                currentDirection = Direction.UP;
            }
        }
        if (this.previousDirection == -1) {
            this.previousDirection = currentDirection;
        }
        if (currentDirection != undefined && currentDirection !== this.previousDirection) {
            // console.log("direction changed");
            this.previousDirection = currentDirection;
            return true;
        }
        return false;
    }

    drawKnife() {
        let linewidth = 0;
        const linewidthinc = 2;
        let minLineWidth: number = 5;
        let pointdrawcount = 1;
        const pointlistsize = this.drawPoints.length

        for (let i = pointlistsize - 2; i >= 0; i--) {
            pointdrawcount++

            if (pointdrawcount >= 15) {
                if (linewidth > minLineWidth)
                    linewidth -= 1;
            } else {
                linewidth += 2;
            }

            const pos0 = this.drawPoints[i + 1];
            const pos = this.drawPoints[i];

            this.ctx.moveTo(pos.x, pos.y);
            this.ctx.lineTo(pos0.x, pos0.y);
            this.ctx.lineWidth = 10;

            this.ctx.stroke();
        }
    }

    update(dt: number) {
        // When the sliding speed is slow, it will not disappear quickly
        if (this.drawPoints.length < 30) {
            for (let i = 0; i < 1; i++) {
                if (this.drawPoints.length > 0) {
                    this.drawPoints.shift();
                } else {
                    break;
                }
            }
        } else {
            for (let i = 0; i < 9; i++) {
                if (this.drawPoints.length > 0) {
                    this.drawPoints.shift();
                } else {
                    break;
                }
            }

            // In order to keep lines from being too long
            while (this.drawPoints.length > 400) {
                this.drawPoints.shift();
            }
        }

    }
}
