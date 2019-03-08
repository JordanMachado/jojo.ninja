import * as PIXI from 'pixi.js';

export default class Social extends PIXI.Container
{
    constructor(scene)
    {
        super();

        this.scene = scene;
        const icons = [{
            id: 'icon-twitter',
            link: 'https://twitter.com/xvi_jojo',
        }, {
            id: 'icon-github',
            link: 'https://github.com/JordanMachado',
        }, {
            id: 'icon-linkedin',
            link: 'https://linkedin.com/in/machadojordan/',
        },
        ];

        this.buttons = [];
        for (let i = 0; i < icons.length; i++)
        {
            const icon = this.createButton(icons[i]);

            icon.offset = { x: 0, y: 0 };
            icon.position.x = i * 70;
            icon.offset.x = i * 70;
            icon.attract = Math.random() * (20 - 10) + 10;
            this.addChild(icon);
            this.buttons.push(icon);
            icon.alpha = 0;
        }
        this.scale.set(0.8);
    }
    show()
    {
        for (let i = 0; i < this.buttons.length; i++)
        {
            TweenLite.to(this.buttons[i], 0.5, {
                alpha: 1,
                delay: 0.1 * i + 0.35,
            });
        }
    }
    createButton(conf)
    {
        const width = 50;
        const height = 50;
        const border = 2;
        const container = new PIXI.Container();

        const frame = new PIXI.Graphics();

        frame.beginFill(0xff0000, 0.0);

        frame.lineStyle(border / 2, 0x000000, 1);
        frame.drawRect(0, 0, width, height);
        container.addChild(frame);

        const graphics = new PIXI.Graphics();

        graphics.alpha = 0;
        graphics.beginFill(0x000000);
        graphics.drawRect(border, border, width - (border * 2), height - (border * 2));

        container.addChild(graphics);

        const icon = new PIXI.Sprite.from(getAsset(conf.id));

        icon.tint = 0x000000;

        icon.anchor.set(0.5);
        icon.position.x = width / 2;
        icon.position.y = height / 2;

        container.addChild(icon);

        container.buttonMode = true;
        container.interactive = true;
        container.mouseover = () =>
        {
            icon.tint = 0xffffff;
            TweenLite.to(graphics, 0.5, {
                alpha: 1,
            });
            TweenLite.to(graphics.position, 0.3, {
                x: 10,
                y: 10,
            });
            TweenLite.to(icon.position, 0.3, {
                x: width / 2 + 10,
                y: height / 2 + 10,
            });
        };
        container.mouseout = () =>
        {
            icon.tint = 0x000000;
            TweenLite.to(graphics, 0.3, {
                alpha: 0,
            });
            TweenLite.to(graphics.position, 0.3, {
                x: 0,
                y: 0,
            });
            TweenLite.to(icon.position, 0.3, {
                x: width / 2,
                y: height / 2,
            });
        };

        container.click = container.tap = () =>
        {
            window.open(conf.link);
        };

        return container;
    }
    updateTransform()
    {
        super.updateTransform();
        for (let i = 0; i < this.buttons.length; i++)
        {
            const btn = this.buttons[i];

            // btn.position.x = btn.offset.x + (-this.scene.mouseEase.x * 10);
            // btn.position.y = btn.offset.y + (-this.scene.mouseEase.y * 10);
        }
    }
}
