precision highp float;

uniform sampler2D uSampler;
uniform sampler2D uVideo;
uniform sampler2D uNoise;
uniform float uPlaying;
uniform float uOverlay;
uniform float uAlpha;
varying vec2 vUv;
varying vec3 vverlet;


void main() {

  vec4 color = texture2D(uSampler, vec2(vUv.x, 1.0- vUv.y));
  vec4 colorVideo = texture2D(uVideo, vec2(vUv.x, 1.0- vUv.y));
  // vec4 noise = texture2D(uNoise, vec2(vUv.x, 1.0- vUv.y));
  // float c = (noise.x + noise.y + noise.z)/3.0 * uPlaying;
  // vec4 finalColor = mix(color,colorVideo, clamp(c + uPlaying,0.0,1.0));
  vec4 finalColor = mix(color,colorVideo, uPlaying);
  finalColor = mix(finalColor, vec4(1.0), uOverlay);
  gl_FragColor = vec4(finalColor.rgb*uAlpha,uAlpha);
}
