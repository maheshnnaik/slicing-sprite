import { _decorator, Component, Node, UITransform, v3, Vec3, math, Mask, find, Prefab, instantiate, Touch, Graphics } from 'cc';
const {ccclass, property} = _decorator;

import LineIntersection from "./utils/LineIntersection";

@ccclass('Slice')
export default class Slice extends Component {

    isSliced: boolean = false;
    onLoad () {
        var canvasNode = find("Canvas");
        canvasNode.on("SLICE", this.handleSlice, this);
    }

    start () {
        // this.reset();
    }

    instantiateDuplicate(intersectionPoint: Vec3[]){
        var duplicateNode = instantiate(this.node);
        duplicateNode.parent = this.node.parent;
        duplicateNode.name = this.node.name + "1";
        duplicateNode.setPosition(this.node.getPosition().add(v3(0, 10, 0)));
        duplicateNode.setRotation(this.node.getRotation());
        duplicateNode.setScale(this.node.getScale());
        duplicateNode.getComponent(Slice).sliceSprite(intersectionPoint, true);
    }

    handleSlice(startPoint: Vec3, endPoint: Vec3){
        if(!this.isSliced){
            var intersectionPoint = this.getIntersectionPoints(startPoint, endPoint);
            if(intersectionPoint.length > 2) {
                this.sliceSprite(intersectionPoint, false);
                // this.instantiateDuplicate(intersectionPoint);
                // find("Canvas").emit("UpdatePoints");
                // return intersectionPoint;
            }
        }
    }

    getIntersectionPoints(startPoint: Vec3, endPoint: Vec3){
        let uiTransform = this.node.getComponent(UITransform);
        let pos = this.node.getPosition();
        let angle = this.node.angle;
        let scale = this.node.getWorldScale();
        var intersectionPoint = LineIntersection.updateBoundsAndGetIntersection(uiTransform, pos, angle, scale, startPoint, endPoint);
        // console.log(intersectionPoint);
        var nodePos = this.node.getPosition();
        if(intersectionPoint.length > 2) {
            intersectionPoint.forEach((point) => {
                point.x = (point.x - nodePos.x) / scale.x;
                point.y = (point.y - nodePos.y) / scale.y;
            });
        }
        return intersectionPoint;
    }
    sliceSprite(intersectionPoint: Vec3[], inverted: boolean){
        this.isSliced = true;
        const mask = this.node.getComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_STENCIL;
        mask.inverted = inverted;
        const graphics = mask.graphics;
        graphics.clear();
        for (let i = 0; i < intersectionPoint.length; ++i) {
            let point = intersectionPoint[i];
            if (i === 0) {
                graphics.moveTo(point.x, point.y);
            }
            else {
                graphics.lineTo(point.x, point.y);
            }
        }
        graphics.close();
        graphics.fill();
    }
    
    reset(){
        this.isSliced = false;
        const size = this.node.getComponent(UITransform).contentSize;
        const width = size.width;
        const height = size.height;
        const ap = this.node.getComponent(UITransform).anchorPoint;
        const x = -width * ap.x;
        const y = -height * ap.y;
        const mask = this.node.getComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_STENCIL;
        const graphics = mask.graphics;
        graphics.clear();
        graphics.rect(x, y, width, height);
        graphics.fill();
    }
}