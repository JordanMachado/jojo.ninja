import * as PIXI from 'pixi.js';
import vs from './shaders/quad.vert';
import fs from './shaders/quad.frag';
import Object3D  from './3d/core/Object3D';
import Signal from 'signals';

export default class Quad extends PIXI.Mesh
{
    constructor(geometry, camera)
    {
        const program = new PIXI.Program(vs, fs);
        const object3d = new Object3D();

        const uniforms = {

            _projectionMatrix: camera.projection,
            _viewMatrix: camera.view,
            worldMatrix: object3d.matrixWorld,
            uOverlay: 0.0,
            uAlpha: 1.0,
            uPlaying: 0,
            uSampler: PIXI.Texture.WHITE,
            uVideo: PIXI.Texture.WHITE,
            // uNoise: new PIXI.Texture.from(getAsset('noise')),
        };

        super(geometry, new PIXI.Shader(program, uniforms), null, PIXI.DRAW_MODES.TRIANGLE);
        this.id = -1;
        this.realId = -1;
        this.transform3d = object3d;
        this.shader.uniforms.worldMatrix = this.transform3d.matrixWorld;
        this.scale(0.4);

        this.updateData = new Signal();
    }
    scale(s)
    {
        const r = 16 / 9;

        this.transform3d.scale.set(s * r, s, s);
    }
    over()
    {
        TweenLite.to(this.shader.uniforms, 0.8, {
            uOverlay: 0.90,
            ease: Quad.easeOut,
        });
        // this.shader.uniforms.worldMatrix = this.transform3d.matrixWorld;
    }
    out()
    {
        TweenLite.to(this.shader.uniforms, 0.5, {
            uOverlay: 0.0,
            ease: Quad.easeOut,
        });
    }
    setData(data)
    {
        this.data = data;
        this.texture = new PIXI.Texture.from(window.getAsset(data.id));
        this.updateData.dispatch();
    }
    resetTexture()
    {
        TweenLite.to(this.shader.uniforms, 0.8, {
            uPlaying: 0,
            ease: Quad.easeOut,
        });
        this.texture = new PIXI.Texture.from(window.getAsset(this.data.id));
    }
    set texture(texture)
    {
        this.shader.uniforms.uSampler = texture;
    }
    set video(texture)
    {
        TweenLite.to(this.shader.uniforms, 0.8, {
            uPlaying: 1,
            ease: Quad.easeOut,
        });

        this.shader.uniforms.uVideo = texture;
    }
    updateTransform(scene)
    {
        this.shader.uniforms.worldMatrix = this.transform3d.matrixWorld;
        // this.shader.uniforms.uAlpha = scene.content.alpha;
    }
}
