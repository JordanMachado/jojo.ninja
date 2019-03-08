import * as PIXI from 'pixi.js';
import vs from './shaders/full.vert';
import fs from './shaders/full.frag';
import Object3D  from './3d/core/Object3D';
import Primitive from './3d/Primitive';

export default class Quad extends PIXI.Mesh
{
    constructor()
    {
        const primQuad = Primitive.quad();

        const geometry = new PIXI.Geometry();

        geometry.addAttribute('position', primQuad.positions);
        geometry.addAttribute('uv', primQuad.uvs);
        geometry.addIndex(primQuad.indices);
        const program = new PIXI.Program(vs, fs);
        const object3d = new Object3D();

        object3d.scale.set(0.3);
        const uniforms = {
            worldMatrix: object3d.matrixWorld,
        };

        super(geometry, new PIXI.Shader(program, uniforms), null, PIXI.DRAW_MODES.TRIANGLE);
        this.active = false;

        this.transform3d = object3d;
        this.shader.uniforms.worldMatrix = this.transform3d.matrixWorld;
    }
    updateTransform()
    {
        this.shader.uniforms.worldMatrix = this.transform3d.matrixWorld;
    }
}
