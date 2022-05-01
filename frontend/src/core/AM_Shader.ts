import * as THREE from 'three';

export class AM_Shader {
  static eyeShader(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        eyeColor: { value: new THREE.Vector3() },
        eyePosition: { value: new THREE.Vector3(0, 0, 1) },
      },

      // language=glsl
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vEyePosition;
        varying vec3 vEyeColor;
        
        uniform vec3 eyeColor;
        uniform vec3 eyePosition;
        
        void main() {
            vUv = uv;
            vEyeColor = eyeColor;
            vEyePosition = eyePosition;
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
        }
      `,
      // language=glsl
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vEyePosition;
        varying vec3 vEyeColor;
        
        void main() {
            vec3 color = vec3(1.0, 1.0, 1.0);
            
            vec2 uv = vUv;
            uv -= 0.5;

            float d = length(vec2(uv.x - vEyePosition.x, uv.y - vEyePosition.y)) - 0.06;
            if (d < vEyePosition.z) {
                color = vec3(0.0);
            }
            
            d = length(vec2(uv.x - vEyePosition.x, uv.y - vEyePosition.y)) - 0.05;
            if (d < vEyePosition.z) {
                color = vEyeColor;
            }

            d = length(vec2(uv.x - vEyePosition.x, uv.y - vEyePosition.y)) - 0.01;
            if (d < vEyePosition.z / 2.0) {
                color = vec3(0.0);
            }
            
            
            /*if (
                vUv.x*vEyePosition.z > (0.4*vEyePosition.z + vEyePosition.x) && 
                vUv.x*vEyePosition.z < (0.6*vEyePosition.z + vEyePosition.x)  && 
                vUv.y*vEyePosition.z > (0.4*vEyePosition.z + vEyePosition.y)  && 
                vUv.y*vEyePosition.z < (0.6*vEyePosition.z + vEyePosition.y) ) {
                color = vEyeColor;
            }*/

            /*if (
            vUv.x > (0.5 - vEyePosition.z) + vEyePosition.x &&
            vUv.x < (0.5 + vEyePosition.z) + vEyePosition.x  &&
            vUv.y > (0.4) &&
            vUv.y < (0.6)) {
                color = vEyeColor;
            }

            if (
            vUv.x > 0.45 + vEyePosition.x &&
            vUv.x < 0.55 + vEyePosition.x &&
            vUv.y > 0.45 + vEyePosition.y &&
            vUv.y < 0.55 + vEyePosition.y) {
                color = vec3(0.0, 0.0, 0.0);
            }*/
            
            gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }
}
