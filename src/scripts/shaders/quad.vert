attribute vec3 position;
attribute vec3 verlet;
attribute vec2 uv;

uniform mat4 _projectionMatrix;
uniform mat4 _viewMatrix;
uniform mat4 worldMatrix;

varying vec2 vUv;
varying vec3 vverlet;

void main() {
  vec4 p = vec4(position + verlet, 1.0);
  vUv = uv;
  vverlet = verlet;
  vec4 worldPos = _projectionMatrix * _viewMatrix * worldMatrix * p;
  gl_PointSize = 50.0;
  gl_Position = worldPos;

}
