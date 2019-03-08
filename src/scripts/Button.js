import * as PIXI from 'pixi.js';

export default class Button extends PIXI.Container
{
    constructor()
    {
        super();

        this.link = 'c';
        this.interactive = true;
        this.buttonMode = true;
        this.click = this.tap = () =>
        {
            window.open(this.link);
        };

        const btn = this.label = new PIXI.Text('hello', {
            fontSize: 105 * 0.3,
            fontFamily: 'Source Sans Pro',
            fill: '0x2d2d2d',
        });

        btn.anchor.x = 0.5;

        const size = btn.width;
        const margin = 30;

        const graphics = this.graphics = new PIXI.Graphics();

        graphics.alpha = 0;
        graphics.beginFill(0x000000);
        graphics.drawRect(-size / 2 - margin / 2, -margin / 2, size + margin, btn.height + margin);

        this.addChild(graphics);

        const frame = this.frame = new PIXI.Graphics();

        frame.beginFill(0xff0000, 0.0);

        frame.lineStyle(2, 0x000000, 1);
        frame.drawRect(0, 0, size + margin, btn.height + margin);
        this.addChild(frame);

        this.addChild(btn);

        this.mouseover = () =>
        {
            btn.style.fill = '0xffffff';
            TweenLite.to(graphics, 0.5, {
                alpha: 1,
            });
            TweenLite.to(graphics.position, 0.3, {
                x: 10,
                y: 10,
            });
            TweenLite.to(btn.position, 0.3, {
                x: 10,
                y: 10,
            });
        };

        this.mouseout = () =>
        {
            btn.style.fill = '0x000000';
            TweenLite.to(graphics, 0.5, {
                alpha: 0,
            });

            TweenLite.to(graphics.position, 0.3, {
                x: 0,
                y: 0,
            });
            TweenLite.to(btn.position, 0.3, {
                x: 0,
                y: 0,
            });
        };
        this.scale.set(0.85);
    }
    setData(data)
    {
        this.link = data.link;
        this.label.text = data.label;
        this.alpha = 0.9;

        const size = this.label.width;
        const margin = 30;

        this.frame.x = -size / 2 - margin / 2;
        this.frame.y = -margin / 2;
        this.frame.width = size + margin;

        // this.graphics.x = -size / 2 - margin / 2;
        // this.graphics.y = -margin / 2;
        this.graphics.width = size + margin;
    }
    hide()
    {
        this.alpha = 0;
    }
}
