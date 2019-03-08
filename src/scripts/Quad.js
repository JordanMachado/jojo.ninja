import * as PIXI from 'pixi.js';
import vs from './shaders/basic.vert';
import fs from './shaders/basic.frag';
import Object3D  from './3d/core/Object3D';
const program = new PIXI.Program(vs, fs);

export default class Quad extends PIXI.Mesh
{
    constructor(geometry, camera)
    {
        const object3d = new Object3D();

        object3d.scale.set(0.5);
        const uniforms = {

            _projectionMatrix: camera.projection,
            _viewMatrix: camera.view,
            worldMatrix: object3d.matrixWorld,
        };

        super(geometry, new PIXI.Shader(program, uniforms), null, PIXI.DRAW_MODES.TRIANGLE);

        this.active = false;
        this.state.culling = true;
        this.state.depthTest = true;
        // this.state.clockwiseFrontFace = true;
        this.transform3d = object3d;
        this.shader.uniforms.worldMatrix = this.transform3d.matrixWorld;
    }
    updateTransform()
    {
        this.shader.uniforms.worldMatrix = this.transform3d.matrixWorld;
    }
}
