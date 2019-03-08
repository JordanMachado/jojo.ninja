attribute vec3 position;
attribute vec2 uv;


varying vec2 vUv;

void main() {
  vec4 p = vec4(position, 1.0);
  vUv = uv;
  vec4 worldPos = p;
  gl_Position = worldPos;

}
