attribute vec3 position;
attribute vec3 normals;
attribute vec2 uv;

uniform mat4 _projectionMatrix;
uniform mat4 _viewMatrix;
uniform mat4 worldMatrix;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vp;

void main() {
  vec4 p = vec4(position, 1.0);
  vec4 worldPos = _projectionMatrix * _viewMatrix * worldMatrix * p;
  gl_Position = worldPos;
  vUv = uv;
  vNormal = normals;
  vp = position;

}
