import * as PIXI from 'pixi.js';
import { vec3 } from 'gl-matrix';
const screenPos = vec3.create();
const temp = vec3.create();
const out = new PIXI.Point();

import Device from './Device';

import CurlFilter from './CurlFilter';
import Button from './Button';
export default class Overlay extends PIXI.Container
{
    constructor(quad, scene)
    {
        super();
        this.quad = quad;
        this.camera = scene.camera;
        this.scene = scene;
        let divisor = 0.82;

        if (Device === 'phone') divisor = 0.7;
        this.title = new PIXI.Text(`Title`, {
            fontSize: 105 * divisor,
            fontFamily: 'Didot',
        });

        this.filterCurl = new CurlFilter();

        // this.filters = [this.filterCurl];
        this.title.filters = [this.filterCurl];
        this.title.anchor.set(0, 0.5);
        // this.title.position.x = -400;
        // this.title.position.y = -100;

        this.quad.updateData.add(() =>
        {
            this.title.text = this.quad.data.title;
        });

        this.bounce = null;

        const gFrame = new PIXI.Graphics();

        gFrame.beginFill(0xff0000, 0.0);
        gFrame.lineStyle(1, 0x000000, 0.2);
        gFrame.drawRect(0.5, 0.5, 512 * 16 / 9, 512);
        const t = window.renderer.generateTexture(gFrame);
        const bg = new PIXI.Sprite(t);

        bg.position.x = -30;
        bg.position.y = -30;
        bg.anchor.set(0.5);
        this.bg = bg;

        this.addChild(bg);

        this.hoverContainer = new PIXI.Container();
        this.hoverContainer.alpha = 1;
        this.infoContainer = new PIXI.Container();
        this.addChild(this.hoverContainer);
        this.hoverContainer.addChild(this.infoContainer);

        const fontSize = 25;
        const fontSize2 = 30;

        this.roleTitle = new PIXI.Text(`ROLE`, {
            fontSize,
            fontFamily: 'Source Sans Pro',
            letterSpacing: 1.3,
        });
        this.infoContainer.addChild(this.roleTitle);

        this.role = new PIXI.Text(`Lead Developer`, {
            fontSize: fontSize2,
            fontFamily: 'Didot',
            fontStyle: 'italic',
            fill: '0x2d2d2d',
            letterSpacing: 1.3,
        });
        this.role.position.y = 40;
        this.infoContainer.addChild(this.role);

        this.clientTitle = new PIXI.Text(`CLIENT`, {
            fontSize,
            fontFamily: 'Source Sans Pro',
            letterSpacing: 1.3,
        });

        this.clientTitle.position.x = this.role.width + 80;
        this.infoContainer.addChild(this.clientTitle);

        this.client = new PIXI.Text(`Stink Studio`, {
            fontSize: fontSize2,
            fontFamily: 'Didot',
            fontStyle: 'italic',
            fill: '0x2d2d2d',
            letterSpacing: 1.3,
        });

        this.client.position.x = this.clientTitle.position.x;
        this.client.position.y = 40;
        this.infoContainer.addChild(this.client);

        this.techTitle = new PIXI.Text(`TECH`, {
            fontSize,
            fontFamily: 'Source Sans Pro',
            letterSpacing: 1.3,
        });
        this.infoContainer.addChild(this.techTitle);
        this.techTitle.position.y = this.role.position.y + 80;
        this.tech = new PIXI.Text(`webgl / glsl`, {
            fontSize: fontSize2,
            fontFamily: 'Didot',
            fontStyle: 'italic',
            fill: '0x2d2d2d',
            letterSpacing: 1.3,
        });
        this.tech.position.y = this.techTitle.position.y + 40;
        this.infoContainer.addChild(this.tech);

        this.description = new PIXI.Text(`Brainside is a web platform gathering\ninteractive experiences taking users through\nthe creative thinking of contemporary artists.`, {
            fontSize: fontSize2,
            fontFamily: 'Didot',
            fontStyle: 'italic',
            fill: '0x2d2d2d',
            letterSpacing: 1.3,
        });
        this.infoContainer.addChild(this.description);
        this.description.position.y = this.tech.position.y + 80;
        this.infoContainer.offset = new PIXI.Point();
        this.addChild(this.title);

        this.btnsContainer = new PIXI.Container();
        this.infoContainer.addChild(this.btnsContainer);
        this.buttons = [];
        for (let i = 0; i < 3; i++)
        {
            const bt = new Button();

            bt.position.x = bt.width / 2 + i * (bt.width + 20);
            this.btnsContainer.addChild(bt);
            this.buttons.push(bt);
        }

        for (let i = 0; i < this.infoContainer.children.length; i++)
        {
            this.infoContainer.children[i].originalPos = { x: this.infoContainer.children[i].position.x, y: this.infoContainer.children[i].position.y };
            this.infoContainer.children[i].alpha = 0;
        }
        this.interactive = true;

        if (Device === 'desktop')
        {
            this.mouseover = () =>
            {
                this.over();
            };
            this.mouseout = () =>
            {
                this.out();
            };
        }
        else
        {
            this.touchstart = () =>
            {
                this.over();
            };
        }
    }
    setData(data)
    {
        this.role.text = data.role;
        this.clientTitle.originalPos.x = this.role.width + 80;
        this.client.originalPos.x = this.clientTitle.originalPos.x;

        this.client.text = data.client;
        this.tech.text = data.tech;
        this.description.text = data.desc;
        this.btnsContainer.position.y = this.description.position.y + this.description.height + 60;
        if (data.btns)
        {
            for (let i = 0; i < this.buttons.length; i++)
            {
                if (data.btns[i])
                {
                    this.buttons[i].setData(data.btns[i]);
                }
                else
                {
                    this.buttons[i].hide();
                }
            }
            let size = 0;

            for (let i = 0; i < this.buttons.length; i++)
            {
                this.buttons[i].position.x = size + this.buttons[i].width / 2;
                size += this.buttons[i].width + 30;
            }
        }
        if (Device === 'phone')
        {
            this.title.position.x = -this.bounce.x + (this.title.width / 2);
            this.title.position.y = -this.bounce.y - this.title.height;
        }
    }

    updateTransform()
    {
        super.updateTransform();
        this.map2dFrom3d(out, this.quad.transform3d.position);
        const start = new PIXI.Point();
        const end = new PIXI.Point();

        // console.log(out);

        this.position.x = out.x.toFixed(1);
        this.position.y = out.y.toFixed(1);
        if (Device !== 'phone')
        {
            this.title.position.y = (this.bounce.y * 1.1) * this.quad.transform3d.position.y / 10 + (-this.scene.mouseEase.y * 30);
            this.title.position.x = -this.bounce.x - 120 + (-this.scene.mouseEase.x * 30);
        }
        else
        {
            this.title.position.x = -this.bounce.x + 50;
        }

        this.title.alpha = 1 - ((Math.abs(this.quad.transform3d.position.y) / 10)) * 0.9;
        this.bg.alpha = 1 - ((Math.abs(this.quad.transform3d.position.y) / 10));

        this.bg.position.x = -30 + (-this.scene.mouseEase.x * 20);
        this.bg.position.y = -30 + (-this.scene.mouseEase.y * 20);

        this.infoContainer.position.x = this.infoContainer.offset.x + (-this.scene.mouseEase.x * 20);
        this.infoContainer.position.y = this.infoContainer.offset.y + (-this.scene.mouseEase.y * 20);

        this.filterCurl.update(this.scene);
    }
    over()
    {
        if (this.hovering) return;
        this.hovering = true;
        this.quad.over();

        this.tl = new TimelineLite();

        // this.roleTitle;
        for (let i = 0; i < this.infoContainer.children.length; i++)
        {
            this.tl.to(this.infoContainer.children[i], 0.25, {
                alpha: 1,
                ease: Quad.easeOut,
            }, '-=0.1');
            this.infoContainer.children[i].position.x = this.infoContainer.children[i].originalPos.x - 30;
            this.tl.to(this.infoContainer.children[i].position, 0.3, {
                x: this.infoContainer.children[i].originalPos.x,
                ease: Quad.easeOut,
            }, '-=0.3');
        }
    }
    createBtn(text, link)
    {
        const container = new PIXI.Container();

        container.interactive = true;
        container.buttonMode = true;
        container.click = container.tap = () =>
        {
            window.open(link);
        };

        const works = new PIXI.Text(text, {
            fontSize: 105 * 0.3,
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
    out()
    {
        this.quad.out();
        this.hovering = false;

        this.tl.stop();
        for (let i = 0; i < this.infoContainer.children.length; i++)
        {
            this.infoContainer.children[i].alpha = 0;
        }
    }
    resize(ww, hh, bounce)
    {
        this.bounce = bounce;
        this.bg.width = this.bounce.x * 2;
        this.bg.height = this.bounce.y * 2;

        this.hoverContainer.position.x = -this.bounce.x;
        this.hoverContainer.position.y = -this.bounce.y;

        if (Device === 'phone')
        {
            this.infoContainer.offset.x = 50;
            this.infoContainer.offset.y = 30;
        }
        else
        {
            this.infoContainer.offset.x = this.bounce.x - 200;
            this.infoContainer.offset.y = this.bounce.y - this.infoContainer.height / 2;
        }
    }
    map2dFrom3d(_out, _in)
    {
        temp[0] = _in.x;
        temp[1] = _in.y;
        temp[2] = _in.z;

        vec3.transformMat4(screenPos, temp, this.camera.view);
        vec3.transformMat4(screenPos, screenPos, this.camera.projection);

        const halfw = renderer.width * 0.5;
        const halfh = renderer.height * 0.5;

        _out.x = (screenPos[0] * halfw) + halfw;
        _out.y = (-screenPos[1] * halfh) + halfh;

        return _out;
    }
}
