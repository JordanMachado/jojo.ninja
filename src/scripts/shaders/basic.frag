precision highp float;

uniform float uAlpha;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vp;



void main() {
  vec3 grad = mix(vec3(1.), vec3(0.7), clamp(1.-vp.z,0.0,1.0));
  vec3 color = mix( grad,vec3(1.),vNormal.b);
  vec4 finalColor = vec4(color,1.);
  gl_FragColor = vec4(finalColor.rgb, finalColor.a);
}
