import * as PIXI from 'pixi.js';
import Wave from './Wave';
import Primitive from './3d/Primitive';

import Device from './Device';

export default class Overlay extends PIXI.Container
{
    constructor(camera)
    {
        super();
        this.divisor = 1;
        if (Device === 'phone')
        {
            this.divisor = 0.7;
        }

        window.page = this;

        this.bg3d = new PIXI.Container();

        const gFrame = new PIXI.Graphics();

        gFrame.beginFill(0xffffff, 1);
        gFrame.drawRect(0, 0, 10, 10);
        const t = window.renderer.generateTexture(gFrame);
        const bg = new PIXI.Sprite(t);

        this.bg = bg;
        this.addChild(bg);
        this.addChild(this.bg3d);

        this.titleContainer = new PIXI.Container();

        this.title = new PIXI.Text(`Jordan Machado`, {
            fontSize: 105 * this.divisor,
            fontFamily: 'Didot',
            fill: '0x2d2d2d',
        });

        this.title.anchor.x = 0.5;
        this.titleContainer.addChild(this.title);

        this.desc = new PIXI.Text(`Freelance Creative Developer`, {
            fontSize: 105 * 0.45 * this.divisor,
            fontFamily: 'Didot',
            fontStyle: 'italic',
            fill: '0x2d2d2d',
        });
        this.desc.anchor.x = 0.5;

        this.titleContainer.addChild(this.desc);

        this.addChild(this.titleContainer);

        this.button = this.createBtn();
        this.addChild(this.button);

        this.initState();

        // this.position.y = -window.innerHeight * 2;

        const primCube = Primitive.cube();

        const geomCube = new PIXI.Geometry();

        geomCube.addAttribute('position', primCube.positions);
        geomCube.addAttribute('uv', primCube.uvs);
        geomCube.addAttribute('normals', primCube.normals);
        geomCube.addIndex(primCube.indices);

        this.wave = new Wave(geomCube, camera, this.bg3d);
        window.wave = this.wave;

        // TweenLite.to(this.position, 0.5, {
        //     y: -this.h,
        //     ease: Quad.easeOut,
        //     onComplete: () =>
        //     {
        //         this.visible = false;
        //     },
        // });
        // this.wave.hide();
        // this.removeChild(this.bg3d);
    }
    createBtn()
    {
        const container = new PIXI.Container();

        container.interactive = true;
        container.buttonMode = true;
        container.click = container.tap = () =>
        {
            TweenLite.to(this.position, 0.5, {
                y: -this.h,
                ease: Quad.easeOut,
                onComplete: () =>
                {
                    this.visible = false;
                },
            });
            this.wave.hide();
            this.removeChild(this.bg3d);
        };

        const works = new PIXI.Text(`works`, {
            fontSize: 105 * 0.4,
            fontFamily: 'Source Sans Pro',
            fill: '0x2d2d2d',
        });

        works.anchor.x = 0.5;

        const size = works.width;
        const margin = 30;

        const graphics = new PIXI.Graphics();

        graphics.alpha = 0;
        graphics.beginFill(0x000000);
        graphics.drawRect(-size / 2 - margin / 2, -margin / 2, size + margin, works.height + margin);

        container.addChild(graphics);

        const frame = new PIXI.Graphics();

        frame.beginFill(0xff0000, 0.0);

        frame.lineStyle(2, 0x000000, 1);
        frame.drawRect(-size / 2 - margin / 2, -margin / 2, size + margin, works.height + margin);
        container.addChild(frame);

        container.addChild(works);

        container.mouseover = () =>
        {
            works.style.fill = '0xffffff';
            TweenLite.to(graphics, 0.5, {
                alpha: 1,
            });
            TweenLite.to(graphics.position, 0.3, {
                x: 10,
                y: 10,
            });
            TweenLite.to(works.position, 0.3, {
                x: 10,
                y: 10,
            });
        };

        container.mouseout = () =>
        {
            works.style.fill = '0x000000';
            TweenLite.to(graphics, 0.5, {
                alpha: 0,
            });

            TweenLite.to(graphics.position, 0.3, {
                x: 0,
                y: 0,
            });
            TweenLite.to(works.position, 0.3, {
                x: 0,
                y: 0,
            });
        };

        return container;
    }
    initState()
    {
        this.title.position.y = 30;
        this.title.alpha = 0;
        this.desc.position.y = this.title.position.y + this.title.height;
        this.desc.alpha = 0;
        this.button.position.y = this.h - this.button.height - 30;

        if (Device === 'phone')
        {
            this.button.position.y = this.desc.position.y + this.h / 2 + 30;
        }
        this.button.alpha = 0;
    }
    show()
    {
        this.initState();

        TweenLite.to(this.title, 0.5, {
            alpha: 1,
        });
        TweenLite.to(this.title.position, 0.5, {
            y: 0,
            delay: 0.05,
        });

        TweenLite.to(this.desc, 0.5, {
            alpha: 0.9,
            delay: 0.15,
        });
        TweenLite.to(this.desc.position, 0.5, {
            y: this.title.position.y + this.title.height - 30,
            delay: 0.20,
        });

        TweenLite.to(this.button, 0.5, {
            alpha: 1,
            delay: 0.30,
        });
        if (Device === 'phone')
        {
            TweenLite.to(this.button.position, 0.5, {
                y: this.desc.position.y + this.h / 2,
                delay: 0.35,
            });
        }
        else
        {
            TweenLite.to(this.button.position, 0.5, {
                y: this.h - this.button.height - 70,
                delay: 0.35,
            });
        }
    }

    updateTransform()
    {
        super.updateTransform();
        if (this.wave)
        { this.wave.update(); }
    }

    resize(w, h)
    {
        this.h = h;
        this.bg.width = w;
        this.bg.height = h;
        this.titleContainer.position.x = w / 2;
        this.titleContainer.position.y = h * 0.5 - this.titleContainer.height;
        this.button.position.x = w / 2;
        this.button.position.y = h - this.button.height - 70;
    }
}
