precision highp float;


varying vec2 vUv;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main() {

  float y = (vUv.y - 0.5) * 2.;
  vec3 finalColor = mix(vec3(1.0), vec3(229.0/255.,227.0/255.,228.0/255.0), abs(y) + random(vUv) * 0.02);
  // vec3 finalColor = mix(vec3(1.0), vec3(0.), abs(y));

  gl_FragColor = vec4(finalColor,1.0);
}
