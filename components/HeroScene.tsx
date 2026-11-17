"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Item = { src: string; w: number; h: number };

/** x, y, z, rotationY, height. Weighted to the right so the headline on the left stays readable. */
const placements: [number, number, number, number, number][] = [
  [3.4, 0.5, 0, -0.25, 1.9],
  [5.6, -1.9, -1.5, -0.35, 1.3],
  [2.0, -2.2, -3.0, -0.15, 1.5],
  [4.8, 2.3, -3.5, -0.3, 1.4],
  [-1.6, 2.8, -5.0, 0.2, 1.6],
  [7.4, 0.2, -5.5, -0.5, 2.0],
  [2.6, 0.1, -7.5, -0.1, 2.3],
  [-4.6, -1.3, -6.5, 0.3, 1.8],
  [5.8, -2.4, -9.0, -0.2, 2.1],
  [-2.2, -2.6, -10.0, 0.15, 1.7],
  [0.6, 2.2, -12.0, 0.0, 2.2],
  [6.2, 1.6, -13.0, -0.3, 2.0],
];

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uBend;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(uv.x * 3.14159) * 0.4 * uBend + sin(uTime * 0.7 + p.x * 2.0 + p.y) * 0.02;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec3 uFog;
  uniform float uHover;
  uniform float uIntro;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vec3 col = texture2D(uTex, vUv).rgb * (0.7 + uHover * 0.45);
    float far = smoothstep(6.0, 24.0, vDepth);
    float near = 1.0 - smoothstep(0.8, 3.2, vDepth);
    float k = clamp(max(far, near) * 0.94 + (1.0 - uIntro), 0.0, 1.0);
    gl_FragColor = vec4(mix(col, uFog, k), 1.0);
    #include <colorspace_fragment>
  }
`;

export default function HeroScene({ items }: { items: Item[] }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const heroEl = document.querySelector<HTMLElement>(".hero");
    if (!mount || !heroEl) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 0, 9);

    const group = new THREE.Group();
    scene.add(group);

    const fog = new THREE.Color(0x0f1b26);
    const shared = {
      uTime: { value: 0 },
      uBend: { value: 0 },
      uIntro: { value: 0 },
      uFog: { value: fog },
    };

    const disposables: { dispose(): void }[] = [];
    const planeGeo = new THREE.PlaneGeometry(1, 1, 20, 20);
    disposables.push(planeGeo);

    type Card = { mesh: THREE.Mesh; hover: { value: number }; base: THREE.Vector3; target: number };
    const cards: Card[] = [];
    const loader = new THREE.TextureLoader();
    const aniso = renderer.capabilities.getMaxAnisotropy();

    items.slice(0, placements.length).forEach((it, i) => {
      const [x, y, z, ry, h] = placements[i];
      const hover = { value: 0 };
      const mat = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: { ...shared, uTex: { value: new THREE.Texture() }, uHover: hover },
      });
      disposables.push(mat);
      loader.load(it.src, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = aniso;
        mat.uniforms.uTex.value = t;
        disposables.push(t);
      });
      const mesh = new THREE.Mesh(planeGeo, mat);
      mesh.scale.set(h * (it.w / it.h), h, 1);
      mesh.position.set(x, y, z);
      mesh.rotation.y = ry;
      group.add(mesh);
      cards.push({ mesh, hover, base: mesh.position.clone(), target: 0 });
    });

    // floating dust, the particles you see in a shaft of light
    const DUST = 500;
    const dp = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      dp[i * 3] = (Math.random() - 0.3) * 18;
      dp[i * 3 + 1] = (Math.random() - 0.5) * 10;
      dp[i * 3 + 2] = Math.random() * -18 + 6;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xaecbd6, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);
    disposables.push(dustGeo, dustMat);

    // interaction
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const ndc = new THREE.Vector2(2, 2);
    const raycaster = new THREE.Raycaster();
    const onMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      const r = mount.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    window.addEventListener("mousemove", onMove);

    // scroll: the camera flies through the frames while the hero is pinned
    const state = { z: 9, intro: 0 };
    let bendTarget = 0;
    const st = ScrollTrigger.create({
      trigger: heroEl,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.to(state, { z: 9 - self.progress * 15.5, duration: 0.9, ease: "power3.out", overwrite: "auto" });
        bendTarget = gsap.utils.clamp(-1, 1, self.getVelocity() / 2500);
      },
    });

    let introDone = false;
    const intro = () => {
      if (introDone) return;
      introDone = true;
      gsap.fromTo(state, { intro: 0 }, { intro: 1, duration: 2, ease: "power2.out" });
    };
    window.addEventListener("intro:start", intro);
    if ((window as unknown as { __introStarted?: boolean }).__introStarted) intro();
    const safety = window.setTimeout(intro, 7000);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      const narrow = w / h < 0.9;
      group.position.set(narrow ? -2.4 : 1.1, narrow ? 1.6 : 0, 0);
      group.scale.setScalar(narrow ? 0.72 : 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      shared.uTime.value = t;
      shared.uIntro.value = state.intro;
      shared.uBend.value += (bendTarget - shared.uBend.value) * 0.08;
      bendTarget *= 0.92;

      camera.position.z = state.z + (1 - state.intro) * 6;
      camera.position.x += (mouse.x * 0.7 - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.05;
      camera.lookAt(camera.position.x * 0.3, camera.position.y * 0.3, camera.position.z - 10);

      // hover highlight
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(cards.map((c) => c.mesh))[0];
      cards.forEach((c, i) => {
        c.target = hit && hit.object === c.mesh ? 1 : 0;
        c.hover.value += (c.target - c.hover.value) * 0.1;
        c.mesh.position.y = c.base.y + Math.sin(t * 0.5 + i * 1.7) * 0.09;
      });

      dust.position.z = (t * 0.12) % 3;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
      st.kill();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("intro:start", intro);
      gsap.killTweensOf(state);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [items]);

  return <div ref={mountRef} className="scene" aria-hidden />;
}
