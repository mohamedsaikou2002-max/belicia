import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  intensity: number; // 0-1, drives glow/distortion
  speaking: boolean;
}

export const BeliciaOrb = ({ intensity, speaking }: Props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const intensityRef = useRef(intensity);
  const speakingRef = useRef(speaking);

  useEffect(() => { intensityRef.current = intensity; }, [intensity]);
  useEffect(() => { speakingRef.current = speaking; }, [speaking]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    // shader-based orb with noise distortion
    const uniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uSpeaking: { value: 0 },
    };

    const geometry = new THREE.IcosahedronGeometry(1.2, 64);
    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform float uSpeaking;
        varying vec3 vNormal;
        varying float vDisplace;

        // simplex noise (snoise) — short version
        vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vNormal = normal;
          float n = snoise(normal * 1.8 + uTime * 0.4);
          float displace = n * (0.15 + uIntensity * 0.5 + uSpeaking * 0.25);
          vDisplace = displace;
          vec3 pos = position + normal * displace;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform float uSpeaking;
        varying vec3 vNormal;
        varying float vDisplace;
        void main() {
          vec3 cyan = vec3(0.2, 1.0, 1.0);
          vec3 magenta = vec3(1.0, 0.3, 1.0);
          float mixv = 0.5 + 0.5 * sin(uTime * 0.5 + vDisplace * 4.0);
          vec3 col = mix(cyan, magenta, mixv);
          float fres = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          col += fres * 0.6;
          float alpha = 0.55 + fres * 0.4 + uSpeaking * 0.15;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // outer wireframe halo
    const halo = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.6, 2),
      new THREE.MeshBasicMaterial({
        color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.15,
      }),
    );
    scene.add(halo);

    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      uniforms.uTime.value = t;
      uniforms.uIntensity.value += (intensityRef.current - uniforms.uIntensity.value) * 0.1;
      uniforms.uSpeaking.value += ((speakingRef.current ? 1 : 0) - uniforms.uSpeaking.value) * 0.08;
      mesh.rotation.y = t * 0.2;
      mesh.rotation.x = Math.sin(t * 0.3) * 0.2;
      halo.rotation.y = -t * 0.1;
      halo.rotation.z = t * 0.05;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const W = mount.clientWidth, H = mount.clientHeight;
        renderer.setSize(W, H);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
      });
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" aria-hidden />;
};
