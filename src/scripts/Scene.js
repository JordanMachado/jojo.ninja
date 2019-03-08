import * as PIXI from 'pixi.js';
import PerspectiveCamera from './3d/camera/PerspectiveCamera';
import Primitive from './3d/Primitive';
import Object3D from './3d/core/Object3D';
import vs from './shaders/quad.vert';
import fs from './shaders/quad.frag';
import createQuad from './createQuad';
import QuadVerlet from './QuadVerlet';
import Quad from './Quad';
import Verlet from './Verlet';
import HitDetect from './3d/utils/HitDetect';
import TouchController from './TouchController';
import projects from './projects.json';
import Overlay from './Overlay';
import { vec3 } from 'gl-matrix';
import Video from './Video';
import QuadFull from './QuadFull';
import Social from './Social';
import IntroPage from './IntroPage';
import Device from './Device';

// import Pingpong from './Pingpong';
const screenPos = vec3.create();

const temp = vec3.create();

export default class Scene
{
    constructor()
    {
        window.scene = this;
        this.video = new Video();
        this.tick = 0;
        this.video.ready.add(this.onVideoReady.bind(this));
        // PIXI.settings.PREFER_ENV = 1;
        this.resolution = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio;
        this.renderer = new PIXI.Renderer(window.innerWidth * this.resolution, window.innerHeight * this.resolution, {
            antialias: true,
            backgroundColor: 0xf9f9f9,
        });
        // PIXI.settings.RESOLUTION =this.resolution;
        window.renderer = this.renderer;

        this.renderer.view.className = 'experiment';
        document.body.appendChild(this.renderer.view);

        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        const sizeQuad = 10;

        this.camera.lookAt([0, 0, 15], [0, 0, 0]);

        this.stage = new PIXI.Container();
        this.content = new PIXI.Container();
        this.intro = new PIXI.Container();
        this.contentBack = new PIXI.Container();

        this.bg = new QuadFull();
        this.contentBack.addChild(this.bg);
        this.stage.addChild(this.contentBack);

        this.stage.addChild(this.intro);

        const gLine = new PIXI.Graphics();

        gLine.beginFill(0x000000, 0.1);
        gLine.drawRect(0, 0, 1, 10);
        const tline = this.renderer.generateTexture(gLine);

        this.lines = [];
        for (let i = 0; i < 3; i++)
        {
            const bg = new PIXI.Sprite(tline);

            this.lines.push(bg);
            this.contentBack.addChild(bg);
        }

        const prim = createQuad(sizeQuad);

        this.verlet = new Verlet(0.00, 0.99);
        this.verlet.setPoints(prim.verletpoints);

        const points = this.verlet.points;

        for (let x = 0; x < sizeQuad; x++)
        {
            for (let y = 0; y < sizeQuad; y++)
            {
                const currentPoint = points[x * sizeQuad + y];
                const nextPointX = points[(x * sizeQuad + y) + 1];
                const nextPointY = points[(x + 1) * sizeQuad + y];
                const prevPointY = points[(x - 1) * sizeQuad + y];

                if (nextPointX)
                {
                    this.verlet.addStick(nextPointX, currentPoint);
                }
                if (nextPointY)
                {
                    this.verlet.addStick(nextPointY, currentPoint);
                }
                else
                {
                    this.verlet.addStick(prevPointY, currentPoint);
                }
            }
        }

        const geometry = new PIXI.Geometry();

        geometry.addAttribute('position', prim.positions);

        geometry.addAttribute('verlet', prim.positions);
        geometry.addAttribute('uv', prim.uvs);
        geometry.addIndex(prim.indices);
        geometry.getAttribute('verlet').static = false;
        this.verletVertices = geometry.getAttribute('verlet').data;
        this.geometry = geometry;

        this.quads = [];
        this.overlays = [];

        for (let i = 0; i < 3; i++)
        {
            const quad = new QuadVerlet(geometry, this.camera);
            //
            const overlay = new Overlay(quad, this);

            this.overlays.push(overlay);
            this.content.addChild(overlay);

            this.quads.push(quad);
            quad.transform3d.position.y = i;

            this.stage.addChild(quad);
        }

        this.time = 0.1;

        const primQuad = Primitive.quad();

        const geomQuad = new PIXI.Geometry();

        geomQuad.addAttribute('position', primQuad.positions);
        geomQuad.addAttribute('uv', primQuad.positions);
        geomQuad.addIndex(primQuad.indices);

        // this.controls.lockZoom(true)
        this.mouse2 = {
            x: 0,
            y: 0,
            z: 0,
        };
        // this.quad.onHit = (hit) =>
        // {
        //     this.mouse2.x = hit[0];
        //     this.mouse2.y = hit[1];
        //     this.mouse2.z = hit[2];
        // };

        // const hit = new HitDetect(this.quad, this.camera);

        this.touchControl = new TouchController();
        this.touchControl.setPosition(0, -2999.999999698761);
        // this.touchControl.setPosition(0, 0);
        this.touchControl.capMovement = false;
        this.touchControl.maxSlots = Infinity;
        this.touchControl.scrollMaxY = Infinity;

        this.touchControl.spring.damp = 0.3;
        this.touchControl.snapTo = true;
        this.touchControl.size = 200;
        this.pos = 0;
        this.easePos = 0;
        this.z = 0;

        this.stage.addChild(this.content);
        this.contentText = new PIXI.Container();
        this.arrowTop = new PIXI.Sprite.from(getAsset('arrow'));
        this.arrowTop.hitArea = new PIXI.Rectangle(-50, -50, 100, 100);
        this.arrowTop.buttonMode = true;
        this.arrowTop.scale.set(0.5);
        this.arrowTop.anchor.set(0.5);
        this.arrowTop.interactive = true;
        this.arrowTop.click = this.arrowTop.tap = () =>
        {
            this.touchControl.previousSlotY();
        };
        this.arrowTop.position.y = -150;
        this.contentText.addChild(this.arrowTop);
        this.texTop = new PIXI.Text('1', {
            fontSize: 44,
            fontFamily: 'Espoir',
        });
        this.texTop.anchor.set(1, 0.5);

        this.contentText.addChild(this.texTop);
        this.texSep = new PIXI.Text('/', {
            fontSize: 64,
            fontFamily: 'Espoir',
        });
        this.texSep.anchor.set(0.5);

        this.texSep.alpha = 0.3;
        this.texSep.position.x = 15;
        this.texSep.position.y = 35;
        this.contentText.addChild(this.texSep);

        this.texBottom = new PIXI.Text(projects.experiments.length, {
            fontSize: 22,
            fontFamily: 'Espoir',
        });
        this.texBottom.anchor.set(0.0, 0.5);
        this.texBottom.position.x = 30;
        this.texBottom.position.y = 64;
        this.contentText.addChild(this.texBottom);
        this.content.addChild(this.contentText);

        this.arrowBottom = new PIXI.Sprite.from(getAsset('arrow'));
        this.arrowBottom.hitArea = new PIXI.Rectangle(-50, -50, 100, 100);
        this.arrowBottom.buttonMode = true;
        this.arrowBottom.scale.set(0.5);
        this.arrowBottom.anchor.set(0.5);
        this.arrowBottom.rotation = Math.PI / 180 * 180;
        this.arrowBottom.interactive = true;
        this.arrowBottom.click = this.arrowBottom.tap = () =>
        {
            this.touchControl.nextSlotY();
        };
        this.arrowBottom.position.y = 200;
        // this.arrowBottom.beginFill(0x000000);
        // this.arrowBottom.drawRect(-10, -10, 20, 20);
        this.contentText.addChild(this.arrowBottom);

        this.computeBounce(0.4);
        this.mouse = { x: 0, y: 0 };
        this.mouseEase = { x: 0, y: 0 };
        window.addEventListener('mousemove', (e) =>
        {
            this.mouse.x = ((e.clientX / window.innerWidth) - 0.5) * 2;
            this.mouse.y = ((e.clientY / window.innerHeight) - 0.5) * 2;
        });
        this.content.interactive = true;
        this.mousePixi = new PIXI.Point();
        this.mousePixiEase = new PIXI.Point();

        this.content.mousemove = (e) =>
        {
            this.mousePixi = e.data.global;
        };

        const gridSize = 20;

        const intro = new IntroPage(this.camera);
        //

        this.intro = intro;

        const primCube = Primitive.cube();

        const geomCube = new PIXI.Geometry();

        geomCube.addAttribute('position', primCube.positions);
        geomCube.addAttribute('uv', primCube.uvs);
        geomCube.addAttribute('normals', primCube.normals);
        geomCube.addIndex(primCube.indices);

        this.stage.addChild(intro);

        this.social = new Social(this);
        this.stage.addChild(this.social);

        const experiments = this.experiments = this.createBtn();

        experiments.scale.set(0.8);

        experiments.alpha = 0;

        this.stage.addChild(experiments);

        setTimeout(() =>
        {
            this.intro.show();
            this.social.show();

            TweenLite.to(experiments, 0.5, {
                alpha: 0.9,
                delay: 0.35,
            });
        }, 500);

        // const debug = new PIXI.Sprite();
        //
        // this.debug = debug;
        // this.debug.scale.set(10);
        //
        // this.content.addChild(debug);
    }
    createBtn()
    {
        const container = new PIXI.Container();

        container.interactive = true;
        container.buttonMode = true;
        container.click = container.tap = () =>
        {
            window.open('http://exp.jojo.ninja');
        };

        const works = new PIXI.Text(`experiments`, {
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

    computeBounce(scale)
    {
        const start = new PIXI.Point();
        const end = new PIXI.Point();

        this.map2dFrom3d(start, { x: -4.5 * (scale * 16 / 9), y: -4.5 * scale, z: 0 });
        this.map2dFrom3d(end, { x: 4.5 * (scale * 16 / 9), y: 4.5 * scale, z: 0 });
        this.bounce = {
            x: end.x - start.x,
            y: start.y - end.y,
        };
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
    render()
    {
        // console.log();
        this.tick++;

        if (this.canUpdate && this.tick % 3 === 0)
        {
            this.video.texture.baseTexture.resource.onUpdate.dispatch();
        }

        // this.verlet.update(this.mouse2);
        // this.introo.update();
        // this.debug.texture = this.introo.simulation.fboOutO;

        this.verlet.update();
        this.geometry.getAttribute('verlet').data = this.verlet.getBuffer();
        this.geometry.getAttribute('verlet').update();

        this.time += 0.1;
        // this.verlet.gravity = Math.sin(this.time) * 0.1;
        // this.camera.lookAt([0, 0, 10 + Math.sin(this.time)], [0, 0, 0]);

        this.touchControl.update();

        this.z += (Math.abs(this.touchControl.speedY2) - this.z) * 0.05;

        this.mouseEase.x += (this.mouse.x - this.mouseEase.x) * 0.1;
        this.mouseEase.y += (this.mouse.y - this.mouseEase.y) * 0.1;
        this.camera.lookAt([this.mouseEase.x, this.mouseEase.y, 15 + Number(this.z)], [0, 0, 0]);

        this.mousePixiEase.x += (this.mousePixi.x - this.mousePixiEase.x) * 0.1;
        this.mousePixiEase.y += (this.mousePixi.y - this.mousePixiEase.y) * 0.1;

        this.contentText.position.x = this.w / 2 + this.bounce.x + 120 + (-this.mouseEase.x * 20);
        this.contentText.position.y = this.h / 2 + (-this.mouseEase.x * 20);

        this.verlet.gravity = this.touchControl.speedY2 * 0.0002;
        const segSize = 10;
        const total = segSize * this.quads.length;

        for (let i = 0; i < this.quads.length; i++)
        {
            const quad = this.quads[i];

            const cam = -this.touchControl.valueY * 0.05;

            this.pos = cam;
            this.easePos += (this.pos - this.easePos) * 0.2;
            quad.transform3d.position.y = (i * segSize) + this.easePos;
            let id = Math.floor((quad.transform3d.position.y + 1) / total);

            id *= this.quads.length;
            id *= -1;
            id += i;
            id = Math.abs(id);
            if (projects.experiments)

            {
                if (id != quad.id)
                {
                    let realId = id;

                    realId %= projects.experiments.length;
                    realId = Math.abs(realId);
                    if (realId < 0)
                    {
                        realId += projects.experiments.length;
                    }
                    quad.id = id;
                    quad.realId = realId;

                    if (projects.experiments[Math.abs(realId)].id)
                    {
                        quad.setData(projects.experiments[Math.abs(realId)]);
                        this.overlays[i].setData(projects.experiments[Math.abs(realId)]);
                    }
                }
            }

            quad.transform3d.position.y %= total;

            if (quad.transform3d.position.y < 0)quad.transform3d.position.y += total;
            quad.transform3d.position.y -= segSize;

            if (quad.transform3d.position.y > (segSize * 2) - 5)quad.transform3d.position.y -= total;

            // console.log(this.touchControl.speedY2);

            if (quad.transform3d.position.y > -3 && quad.transform3d.position.y < 3)
            {
                if (!quad.active)
                {
                    quad.active = true;
                    this.show(quad);
                    if (Device === 'phone')
                    {
                        console.log('cc', i);
                        // console.log(this.overlays[i]);
                        // this.overlays[i].over();
                    }
                }
            }
            else
            {
                if (quad.active)
                {
                    this.hide();
                    if (Device === 'phone')
                    {
                        console.log('cc', i);
                        console.log(this.overlays[i]);
                        if (this.overlays[i].tl)
                        { this.overlays[i].out(); }
                    }
                }
                quad.active = false;
            }
        }
        // this.quad.transform3d.position.x = Math.sin(this.time);
        this.renderer.render(this.stage);
    }
    resize(ww, hh)
    {
        const w = ww * this.resolution;
        const h = hh * this.resolution;

        this.w = w;
        this.h = h;

        this.intro.resize(w, h);

        this.renderer.resize(w, h);
        this.camera.aspect = w / h;
        let scale = 0.4;

        if (window.innerWidth < 1024)
        {
            scale = 0.35;
            this.contentText.visible = true;
        }

        if (window.innerWidth < 900)
        {
            scale = 0.30;
            this.contentText.visible = true;
        }
        if (window.innerWidth < 800)
        {
            scale = 0.25;
            this.contentText.visible = false;
        }
        for (let i = 0; i < this.quads.length; i++)
        {
            this.quads[i].scale(scale * 0.9);
        }
        this.computeBounce(scale * 0.9);

        for (let i = 0; i < this.lines.length; i++)
        {
            this.lines[i].position.x = (i + 0.5) * (w / 3);
            this.lines[i].height = h;
        }

        for (let i = 0; i < this.overlays.length; i++)
        {
            this.overlays[i].resize(ww, hh, this.bounce);
        }

        this.experiments.position.x = w - this.experiments.width / 2 - 40;
        this.experiments.position.y = h - this.experiments.height / 2 - 80 - this.social.height;

        this.social.position.x = w - this.social.width - 40;
        this.social.position.y = h - this.social.height - 40;
    }
    show(quad)
    {
        clearTimeout(this.timer);

        if (this.currentQuad !== quad)
        {
            this.timer = setTimeout(() =>
            {
                if (this.currentQuad)
                { this.currentQuad.resetTexture(); }
                this.currentQuad = quad;
                this.canUpdate = false;
                this.video.setSource(this.currentQuad.data.video);
            }, 500);
        }

        this.texTop.text = `${quad.realId + 1}`;
        this.texBottom.text = this.texBottom.text;
    }
    onVideoReady()
    {
        this.canUpdate = true;
        this.currentQuad.video = this.video.texture;
    }
    hide()
    {
        // if (this.text.alpha > 0)
        // {
        // TweenLite.to(this.content, 0.2, {
        //     alpha: 0,
        // });
        // }
    }
}
