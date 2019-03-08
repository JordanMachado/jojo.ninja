import Object3D  from './3d/core/Object3D';
import Primitive from './3d/Primitive';
import PingPong from './PingPong';
function random(min, max)
{
    return Math.random() * (max - min) + min;
}

export default class Intro extends PIXI.Mesh
{
    constructor(camera)
    {
        const prim = Primitive.cube();
        const object3d = new Object3D();

        object3d.scale.set(0.05);

        const width = 24;
        const height = 24;
        const dataPos = new Float32Array(width * height * 4);
        const uvs = new Float32Array(width * height * 2);
        let count = 0;

        for (let i = 0, l = width * height * 4; i < l; i += 4)
        {
            dataPos[i] = random(-10, 10) / 256;
            dataPos[i + 1] = random(-10, 10) / 256;
            dataPos[i + 2] = random(-10, 10) / 256;
            dataPos[i + 3] = 1;

            uvs[count * 2 + 0] = (count % width) / width;
            uvs[count * 2 + 1] = Math.floor(count / width) / height;
            count++;
        }
        console.log(width, height);

        const t = PIXI.Texture.fromBuffer(dataPos, width, height, {
            mipmap: false,
            type: PIXI.TYPES.FLOAT,
        });

        console.log(t);

        const simulation = new PingPong({
            data: t,
            width,
            height,
        });

        const geometry = new PIXI.Geometry();

        geometry.addAttribute('position', prim.positions);
        geometry.addAttribute('uv', prim.uvs);
        geometry.addIndex(prim.indices);
        geometry.addAttribute('aPosOffset', dataPos, 3, false, PIXI.TYPES.FLOAT, 0, 0, true);
        geometry.addAttribute('uv', uvs, 2, false, PIXI.TYPES.FLOAT, 0, 0, true);

        geometry.instanceCount = width * height;

        const uniforms = {
            _projectionMatrix: camera.projection,
            _viewMatrix: camera.view,
            worldMatrix: object3d.matrixWorld,
            uBuffer: t,
        };

        const program = new PIXI.Program(`
          attribute vec3 position;
          attribute vec3 aPosOffset;
          attribute vec2 uv;

          uniform mat4 _projectionMatrix;
          uniform mat4 _viewMatrix;
          uniform mat4 worldMatrix;

          varying vec2 vUv;
          varying vec3 vverlet;

          uniform sampler2D uBuffer;


          void main() {
            vec4 pos = texture2D(uBuffer,uv);
            pos.xyz *= 256.;

            vec4 p = vec4(position + pos.xyz, 1.0);
            vUv = uv;
            vec4 worldPos = _projectionMatrix * _viewMatrix * worldMatrix * p;
            gl_Position = worldPos;

          }

          `,
        `
          precision highp float;
          void main() {
            gl_FragColor = vec4(0.,1.0,0.0,1.0);
          }

          `);

        super(geometry, new PIXI.Shader(program, uniforms), null, PIXI.DRAW_MODES.TRIANGLE);

        this.simulation = simulation;
        this.t = t;
    }
    update()
    {
        this.shader.uniforms.uBuffer = this.simulation.fboOutO;
        this.simulation.update();

        // console.log();
    }
}
