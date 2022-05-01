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
          #define PHONG

          varying vec3 vViewPosition;
          #include <common>
          #include <uv_pars_vertex>
          #include <uv2_pars_vertex>
          #include <displacementmap_pars_vertex>
          #include <envmap_pars_vertex>
          #include <color_pars_vertex>
          #include <fog_pars_vertex>
          #include <normal_pars_vertex>
          #include <morphtarget_pars_vertex>
          #include <skinning_pars_vertex>
          #include <shadowmap_pars_vertex>
          #include <logdepthbuf_pars_vertex>
          #include <clipping_planes_pars_vertex>
          
          varying vec2 vUv;
          varying vec3 vEyePosition;
          varying vec3 vEyeColor;
        
          uniform vec3 eyeColor;
          uniform vec3 eyePosition;
          
          void main() {
              vUv = uv;
              vEyeColor = eyeColor;
              vEyePosition = eyePosition;

              #include <uv_vertex>
              #include <uv2_vertex>
              #include <color_vertex>
              #include <morphcolor_vertex>
              #include <beginnormal_vertex>
              #include <morphnormal_vertex>
              #include <skinbase_vertex>
              #include <skinnormal_vertex>
              #include <defaultnormal_vertex>
              #include <normal_vertex>
              #include <begin_vertex>
              #include <morphtarget_vertex>
              #include <skinning_vertex>
              #include <displacementmap_vertex>
              #include <project_vertex>
              #include <logdepthbuf_vertex>
              #include <clipping_planes_vertex>
              vViewPosition = - mvPosition.xyz;
              #include <worldpos_vertex>
              #include <envmap_vertex>
              #include <shadowmap_vertex>
              #include <fog_vertex>
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
