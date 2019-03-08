import * as PIXI from 'pixi.js';

export default class CurlFilter extends PIXI.Filter
{
    constructor()
    {
        const vertexShader = null;
        const fragmentShader
            = `precision ${PIXI.settings.PRECISION_FRAGMENT} float;

            vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}


            varying vec2 vTextureCoord;

            uniform sampler2D uSampler;
            uniform float radius;
            uniform float angle;
            uniform float time;
            uniform vec2 offset;
            uniform vec4 filterArea;

            vec2 mapCoord( vec2 coord )
            {
                coord *= filterArea.xy;
                coord += filterArea.zw;

                return coord;
            }

            vec2 unmapCoord( vec2 coord )
            {
                coord -= filterArea.zw;
                coord /= filterArea.xy;

                return coord;
            }

            vec2 twist(vec2 coord)
            {
                coord -= offset;

                float dist = length(coord);
                float n2 = cnoise(vTextureCoord/5. + time) ;
                float n = cnoise(vTextureCoord*5. + time) * 20.;


                if (dist + n< radius )
                {
                    float ratioDist = (radius - dist) / radius;
                    float angleMod = ratioDist * ratioDist * (angle);
                    float s = sin(angleMod);
                    float c = cos(angleMod);
                    coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c) + n;
                }

                coord += offset;

                return coord;
            }

            void main(void)
            {

                vec2 coord = mapCoord(vTextureCoord);

                coord = twist(coord);



                coord = unmapCoord(coord);

                // float  n = cnoise(vTextureCoord*5. + time);

                gl_FragColor = texture2D(uSampler, coord );
                // gl_FragColor = vec4(vec3(n),1.0);

            }


        `;
        const uniforms = {
            radius: 80,
            angle: 2,
            padding: 20,
            offset: new PIXI.Point(0, 0),
            time: 0,
        };

        super(vertexShader, fragmentShader, uniforms);
    }
    update(scene)
    {
        // console.log(this.uniforms);
        // console.log(mouse);
        const m = scene.mousePixiEase;

        // console.log(m);
        this.uniforms.offset.x = m.x;
        this.uniforms.offset.y = m.y;
        this.uniforms.time += 0.01;
        // this.uniforms.red.x = m.x / 2;
        // this.uniforms.red.y = m.y / 2;
        //
        // this.uniforms.green.x = -m.x;
        // this.uniforms.green.y = -m.y;
        //
        // this.uniforms.blue.x = m.x;
        // this.uniforms.blue.y = m.y;
    }
}
