import Signal from 'signals';
import DoubleSpring from './DoubleSpring';

const getMouse = function (mEvent, mTarget)
{
    const o = mTarget || {};

    if (mEvent.touches)
    {
        o.x = mEvent.touches[0].pageX;
        o.y = mEvent.touches[0].pageY;
    }
    else
    {
        o.x = mEvent.clientX;
        o.y = mEvent.clientY;
    }

    return o;
};

class PixiTrackpad
{
    constructor(parameters)
    {
        // this.owner = parameters.owner;
        this.deltas = [0, 0, 0, 0, 0];

        this.spring = new DoubleSpring();
        this.onScrollUpdate = new Signal();
        this.onUP = new Signal();
        // this.target = parameters.target;
        this.value = 0;
        this.easingValue = 0;
        this.dragOffset = 0;
        this.dragging = false;
        this.speed = 0;
        this.wheelPos = 0;
        this.first = true;

        this.scale = 0.5;
        this.size = 1024;
        this.maxSlots = 1000000000;
        this.capMovement = true;
        this.prevPosition = 0;
        this.valueY = 0;
        this.easingValueY = 0;
        this.dragOffsetY = 0;
        this.speedY = 0;
        this.speedY2 = 0;
        this.prevPositionY = 0;
        this.didMove = false;
        this.didMoveY = false;

        this.scrollMin = -Infinity;
        this.scrollMax = 0;
        this.scrollMinY = -Infinity;
        this.scrollMaxY = 0;
        this.snapTo = false;

        this.onDidMove = new Signal();

        // console.log(parameters.scrollbar === true, Device.instance.isMobile);

        this._onDownBinded = this.onDown.bind(this);
        this._onUpBinded = this.onUp.bind(this);
        this._onMoveBinded = this.onMove.bind(this);
        this._onMouseWheelBinded = this.onMouseWheel.bind(this);

        // this.target
        // .on('touchstart', this._onDownBinded)
        // .on('mousedown', this._onDownBinded);
        window.addEventListener('mousedown', this._onDownBinded);
        window.addEventListener('touchstart', this._onDownBinded);
        window.addEventListener('mousewheel', this._onMouseWheelBinded);
        window.addEventListener('DOMMouseScroll', (e) =>
        {
            // console.log(e.detail);

            if (this.peak())
            {
                this.locky = 15;
                if (e.detail > 0)
                { this.nextSlotY(); }
                else
                {
                    this.previousSlotY();
                }
                // this.deltas = [0, 0, 0, 0, 0];
            }

            this.deltas.shift();
            this.deltas.push(Math.abs(e.detail));
            // console.log(this.deltas);
        });

        window.addEventListener('keyup', this._onKeyDown.bind(this));
    }
    _onKeyDown(event)
    {
        switch (event.keyCode)
        {
            case 38:
                // prev
                this.previousSlotY();
                break;
            case 40:
                // next
                this.nextSlotY();
                break;
            default:
                break;
        }
    }
    peak()
    {
        if (this.locky > 0)
        {
            this.locky--;

            return false;
        }
        if (this.deltas[0] < this.deltas[2] && this.deltas[1] < this.deltas[2] && this.deltas[3] > this.deltas[2] && this.deltas[4] > this.deltas[2])
        {
            return true;
        }

        return false;
    }
    unlock()
    {
        this.locked = false;
        this.speed = 0;
        this.easingValue = this.value;
        this.easingValueY = this.valueY;
        this.speedY = 0;
        this.speedX = 0;

        this.dragging = false;
        window.removeEventListener('touchend', this._onUpBinded);
        window.removeEventListener('mouseup', this._onUpBinded);
        window.removeEventListener('mousemove', this._onMoveBinded);
        window.removeEventListener('touchmove', this._onMoveBinded);
    }

    lock()
    {
        this.locked = true;
        window.onmousewheel = null;
    }

    update()
    {
        if (this.locked)
        {
            return;
        }

        this.value += (this.easingValue - this.value) * 0.3;
        this.valueY += (this.easingValueY - this.valueY) * 0.3;

        if (this.dragging)
        {
            let newSpeed = this.easingValue - this.prevPosition;

            newSpeed *= 0.7;

            this.speed += (newSpeed - this.speed) * 0.5;
            this.prevPosition = this.easingValue;

            let newSpeedY = this.easingValueY - this.prevPositionY;

            newSpeedY *= 0.7;

            this.speedY += (newSpeedY - this.speedY) * 0.5;
            this.speedY2 = this.speedY * 0.3;
            this.prevPositionY = this.easingValueY;
        }
        else
        if (this.snapTo)
        {
            this.speedY2 *= 0.1;

            this.speed = this.spring.dx;
            this.spring.update();
            this.easingValue = this.spring.x;
            this.easingValueY = this.spring.y;

            if (this.capMovement)
            {
                if (this.easingValue > this.scrollMax)
                {
                    this.easingValue += (this.scrollMax - this.easingValue) * 0.3; // 6666;
                }
                else if (this.easingValue < this.scrollMin)
                {
                    this.easingValue += (this.scrollMin - this.easingValue) * 0.3; // 6666;
                }

                if (this.easingValueY > this.scrollMaxY)
                {
                    this.easingValueY += (this.scrollMaxY - this.easingValueY) * 0.3; // 6666;
                }
                else if (this.easingValueY < this.scrollMinY)
                {
                    this.easingValueY += (this.scrollMinY - this.easingValueY) * 0.3; // 6666;
                }
            }
        }
    }

    stop()
    {
        this.speed = 0;
        this.speedY = 0;

        this.value = this.prevPosition = this.easingValue;
        this.valueY = this.prevPositionY = this.easingValueY;
    }

    setPosition(value, valueY)
    {
        this.value = this.easingValue = this.spring.tx = this.spring.x = this.prevPosition = this.speed = value;
        this.valueY = this.easingValueY = this.spring.ty = this.spring.y = this.prevPositionY = this.speedY = valueY;
    }

    easeToPosition(value, valueY)
    {
        this.easingValue = value;
        this.easingValueY = valueY;
    }

    onDown(e)
    {
        if (this.locked)
        {
            return;
        }

        this.speed = 0;
        this.speedY = 0;

        this.stop();

        this.didMove = false;
        this.didMoveY = false;
        const mouse = getMouse(e);

        this.checkX = mouse.x;
        this.checkY = mouse.y;

        this.dragging = true;
        this.dragOffset = mouse.x - this.value;
        this.dragOffsetY = mouse.y - this.valueY;
        window.addEventListener('touchend', this._onUpBinded);
        window.addEventListener('mouseup', this._onUpBinded);
        window.addEventListener('mousemove', this._onMoveBinded);
        window.addEventListener('touchmove', this._onMoveBinded);
        // this.owner.interactiveChildren = true;
        //   this.target
        // .on('touchend', this._onUpBinded)
        // .on('touchendoutside', this._onUpBinded)
        // .on('mouseup', this._onUpBinded)
        // .on('mouseupoutside', this._onUpBinded)
        // .on('touchmove', this._onMoveBinded)
        // .on('mousemove', this._onMoveBinded);
    }

    onMouseWheel(event)
    {
        // if(!this.target.interactive)return;

        if (event.preventDefault)
        {
            event.preventDefault();
        }
        else
        {
            event.returnValue = false;
        }

        if (this.locked)
        {
            return;
        }

        this.speedY2 = event.wheelDeltaY * 0.15;
        // this.easingValueY = this.wheelPos * 0.15;
        // this.valueY = this.wheelPos * 0.15;
        // this.easingValueY = this.wheelPos / this.size;
        if (Math.abs(event.wheelDeltaY) < 80) return;

        if (this.first)
        {
            // this.wheelPos = this.spring.ty;
            // this.first = false;
        }
        // this.wheelPos += Number(Math.sign(-event.deltaY));
        // console.log(this.wheelPos);
        this.spring.ty += Number(Math.sign(-event.deltaY)) * 20;
        clearTimeout(this.timer);
        this.timer = setTimeout(() =>
        {
            this.first = true;
            this.wheelPos = 0;
            // console.log(this.spring.ty % this.size);
            if ((this.spring.ty / this.size) % 1 !== 0)
            {
                // console.log((this.spring.ty / this.size) % 1);
                const end = (this.spring.ty / this.size) % 1;

                // console.log(event.deltaY);

                // console.log(end);
                let currentSlot;

                currentSlot = Math.round(-this.spring.ty / this.size);
                if (Math.abs(end) < 0.5)
                {
                    currentSlot += Math.sign(event.deltaY);
                    this.spring.ty += this.size * Math.sign(event.deltaY);
                }

                // if (Math.abs(end) < 0.5)
                // {
                // currentSlot++;
                // }
                // {
                //     currentSlot = Math.round(-this.spring.ty / this.size);
                // }
                // else
                // {
                // }

                this.setSlotY(currentSlot);
            }
        }, 50);
        // console.log(event);

        // this.cap();
    }

    onUp()
    {
        if (this.locked)
        {
            return;
        }

        this.dragging = false;

        if (this.snapTo)
        {
            if (this.didMove)
            {
                this.spring.dx = this.speed;

                let target;

                if (this.speed < 0)
                {
                    target = Math.floor(this.easingValue / this.size);
                }
                else
                {
                    target = Math.ceil(this.easingValue / this.size);
                }

                this.onUP.dispatch();
                // this.owner.interactiveChildren = true;

                if (this.capMovement)
                {
                    if (target > 0)
                    {
                        target = 0;
                    }
                    else if (target < -this.maxSlots)
                    {
                        target = -this.maxSlots;
                    }
                }

                this.spring.tx = target * this.size;

                // / do y!
                this.spring.dy = this.speedY;

                if (this.speedY < 0)
                {
                    target = Math.floor(this.easingValueY / this.size);
                }
                else
                {
                    target = Math.ceil(this.easingValueY / this.size);
                }

                if (this.capMovement)
                {
                    if (target > 0)
                    {
                        target = 0;
                    }
                    else if (target < -this.maxSlots)
                    {
                        target = -this.maxSlots;
                    }
                }

                this.spring.ty = target * this.size;
            }

            this.spring.x = this.easingValue;
            this.spring.y = this.easingValueY;
        }

        this.cap();
        // this.didMove = false;
        window.removeEventListener('touchend', this._onUpBinded);
        window.removeEventListener('mouseup', this._onUpBinded);
        window.removeEventListener('mousemove', this._onMoveBinded);
        window.removeEventListener('touchmove', this._onMoveBinded);

        //   this.target
        // .off('touchend', this._onUpBinded)
        // .off('touchendoutside', this._onUpBinded)
        // .off('mouseup', this._onUpBinded)
        // .off('mouseupoutside', this._onUpBinded)
        // .off('touchmove', this._onMoveBinded)
        // .off('mousemove', this._onMoveBinded);
    }

    cap()
    {
        if (!this.capMovement)
        {
            return;
        }

        // console.log(this.spring.tx, this.scrollMin)
        if (this.snapTo)
        {
            if (this.spring.tx > this.scrollMax)
            {
                this.spring.tx = this.scrollMax;
            }
            else if (this.spring.tx < this.scrollMin)
            {
                this.spring.tx = this.scrollMin;
            }
        }

        if (this.snapTo)
        {
            if (this.spring.ty > this.scrollMaxY)
            {
                this.spring.ty = this.scrollMaxY;
            }
            else if (this.spring.ty < this.scrollMinY)
            {
                this.spring.ty = this.scrollMinY;
            }
        }

    //    if(this.spring.tx < -(this.maxSlots * this.size)) this.spring.tx = -(this.maxSlots * this.size);
    }

    setSlot(index, instant)
    {
        this.spring.tx = index * -this.size;

        if (instant)
        {
            this.value = this.easingValue = this.spring.x = this.spring.tx;
        }

        this.cap();
    //    if(this.spring.tx < -(this.maxSlots * this.size)) this.spring.tx = -(this.maxSlots * this.size);
    }

    setSlotY(index)
    {
        this.spring.ty = index * -this.size;
        this.cap();
    //    if(this.spring.tx < -(this.maxSlots * this.size)) this.spring.tx = -(this.maxSlots * this.size);
    }

    nextSlot()
    {
        //  this.currentSlot++;
        this.spring.tx -= this.size;
        if (this.spring.tx < -(this.maxSlots * this.size))
        {
            this.spring.tx = -(this.maxSlots * this.size);
        }

        this.cap();
    }

    nextSlotY()
    {
        //  this.currentSlot++;

        this.spring.ty -= this.size;
        TweenLite.to(this, 0.3, {
            speedY2: this.size * 0.2,
            ease: Quad.easeOut,

        });

        if (this.spring.ty < -(this.maxSlots * this.size))
        {
            this.spring.ty = -(this.maxSlots * this.size);
        }

        this.cap();
    }

    previousSlot()
    {
        //  this.currentSlot--;
        this.spring.tx += this.size;
        // if(this.spring.tx > 0) this.spring.tx = 0;
        this.cap();
    }

    previousSlotY()
    {
        //  this.currentSlot--;
        TweenLite.to(this, 0.3, {
            speedY2: this.size * 0.2,
            ease: Quad.easeOut,

        });
        this.spring.ty += this.size;
        // if(this.spring.ty > 0) this.spring.ty = 0;
        this.cap();
    }

    setSize(size)
    {
        this.size = size;
        if (this.scrollbar)
        {
            this.scrollBar.setSize(size);
        }
    }

    setSlots(slots)
    {
        this.maxSlots = slots - 1;
    }

    onMove(e)
    {
        if (this.locked)
        {
            return;
        }

        const mouse = getMouse(e);

        let dist;

        dist = Math.abs(this.checkX - mouse.x);
        if (dist > 10)
        {
            if (!this.didMove)
            {
                // this.owner.interactiveChildren = false;
                this.onDidMove.dispatch();
            }
            this.didMove = true;
        }

        dist = Math.abs(this.checkY - mouse.y);
        if (dist > 10)
        {
            this.didMoveY = true;
        }

        this.easingValue = (mouse.x - this.dragOffset);
        this.easingValueY = (mouse.y - this.dragOffsetY);

        if (this.capMovement)
        {
            if (this.easingValue > this.scrollMax)
            {
                this.easingValue = this.scrollMax + (this.easingValue - this.scrollMax) * 0.3;
            }
            else if (this.easingValue < this.scrollMin)
            {
                this.easingValue = this.scrollMin + (this.easingValue - this.scrollMin) * 0.3; // 6666;
            }

            if (this.easingValueY > this.scrollMaxY)
            {
                this.easingValueY = this.scrollMaxY + (this.easingValueY - this.scrollMaxY) * 0.3;
            }
            else if (this.easingValueY < this.scrollMinY)
            {
                this.easingValueY = this.scrollMinY + (this.easingValueY - this.scrollMinY) * 0.3; // 6666;
            }
        }
    }
}

export default PixiTrackpad;
