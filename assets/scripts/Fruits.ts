
import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

 
@ccclass('Fruits')
export class Fruits extends Component {

    onLoad(){
        // let canvas = find('Canvas');
        // let canvasSize = canvas.getComponent(UITransform).contentSize;
        // let finalPos = v3(this.node.getPosition().x + 50, canvasSize.height - 100, 0);
        // tween(this.node).to(4, {position: v3(), angle: 180}).start().repeatForever();
    }
    start () {
        // [3]
    }

    update (deltaTime: number) {
        // var position = this.node.getPosition();
        // position.add(v3(0.6, 0.2));
        // var rotation = this.node.eulerAngles;
        // rotation.add(v3(0, 0, 0.2));
        // this.node.setPosition(position);
        // this.node.setRotationFromEuler(rotation);
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/en/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/en/scripting/life-cycle-callbacks.html
 */
