/* ═══════════════════════════════════════════════════════════════
   COLOR BENDS — Vanilla JS Port (from React Bits)
   Three.js WebGL shader-based animated background
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';

const MAX_COLORS = 8;

const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    for (int j = 0; j < 5; j++) {
      if (j >= uIterations - 1) break;
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
      q += (rr - q) * 0.15;
    }

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
            sumCol += uColors[i] * w;
            cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    col *= uIntensity;

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    gl_FragColor = vec4(rgb, a);
}
`;

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

/**
 * Creates a ColorBends WebGL background inside the given container element.
 * @param {HTMLElement} container — The DOM element to render into.
 * @param {Object} opts — Configuration options (see defaults below).
 * @returns {Object} Controller with destroy() and update() methods.
 */
export function createColorBends(container, opts = {}) {
  const {
    rotation = 90,
    speed = 0.2,
    colors = [],
    transparent = true,
    autoRotate = 0,
    scale = 1,
    frequency = 1,
    warpStrength = 1,
    mouseInfluence = 1,
    parallax = 0.5,
    noise = 0.15,
    iterations = 1,
    intensity = 1.5,
    bandWidth = 6,
  } = opts;

  // ── Three.js setup ──
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);

  const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));

  const toVec3 = (hex) => {
    const h = hex.replace('#', '').trim();
    const v =
      h.length === 3
        ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
        : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    return new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255);
  };

  // Populate initial colors
  const colorVecs = (colors || []).filter(Boolean).slice(0, MAX_COLORS).map(toVec3);
  for (let i = 0; i < MAX_COLORS; i++) {
    if (i < colorVecs.length) uColorsArray[i].copy(colorVecs[i]);
  }

  const rad = ((rotation % 360) * Math.PI) / 180;

  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uCanvas: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uRot: { value: new THREE.Vector2(Math.cos(rad), Math.sin(rad)) },
      uColorCount: { value: colorVecs.length },
      uColors: { value: uColorsArray },
      uTransparent: { value: transparent ? 1 : 0 },
      uScale: { value: scale },
      uFrequency: { value: frequency },
      uWarpStrength: { value: warpStrength },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uMouseInfluence: { value: mouseInfluence },
      uParallax: { value: parallax },
      uNoise: { value: noise },
      uIterations: { value: iterations },
      uIntensity: { value: intensity },
      uBandWidth: { value: bandWidth },
    },
    premultipliedAlpha: true,
    transparent: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: 'high-performance',
    alpha: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, transparent ? 0 : 1);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const clock = new THREE.Clock();
  let rafId = null;
  let currentRotation = rotation;
  let currentAutoRotate = autoRotate;

  // Pointer smoothing
  const pointerTarget = new THREE.Vector2(0, 0);
  const pointerCurrent = new THREE.Vector2(0, 0);
  const pointerSmooth = 8;

  // ── Resize handling ──
  const handleResize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    material.uniforms.uCanvas.value.set(w, h);
  };

  handleResize();

  let resizeObserver = null;
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
  } else {
    window.addEventListener('resize', handleResize);
  }

  // ── Pointer handling ──
  const handlePointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
    const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
    pointerTarget.set(x, y);
  };

  container.addEventListener('pointermove', handlePointerMove);

  // ── Animation loop ──
  const loop = () => {
    const dt = clock.getDelta();
    const elapsed = clock.elapsedTime;
    material.uniforms.uTime.value = elapsed;

    const deg = (currentRotation % 360) + currentAutoRotate * elapsed;
    const r = (deg * Math.PI) / 180;
    material.uniforms.uRot.value.set(Math.cos(r), Math.sin(r));

    const amt = Math.min(1, dt * pointerSmooth);
    pointerCurrent.lerp(pointerTarget, amt);
    material.uniforms.uPointer.value.copy(pointerCurrent);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);

  // ── Public API ──
  return {
    /** Cleanly tear down the WebGL context and event listeners */
    destroy() {
      if (rafId !== null) cancelAnimationFrame(rafId);
      container.removeEventListener('pointermove', handlePointerMove);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },

    /** Update props at runtime */
    update(newOpts) {
      if (newOpts.rotation !== undefined) currentRotation = newOpts.rotation;
      if (newOpts.autoRotate !== undefined) currentAutoRotate = newOpts.autoRotate;
      if (newOpts.speed !== undefined) material.uniforms.uSpeed.value = newOpts.speed;
      if (newOpts.scale !== undefined) material.uniforms.uScale.value = newOpts.scale;
      if (newOpts.frequency !== undefined) material.uniforms.uFrequency.value = newOpts.frequency;
      if (newOpts.warpStrength !== undefined) material.uniforms.uWarpStrength.value = newOpts.warpStrength;
      if (newOpts.mouseInfluence !== undefined) material.uniforms.uMouseInfluence.value = newOpts.mouseInfluence;
      if (newOpts.parallax !== undefined) material.uniforms.uParallax.value = newOpts.parallax;
      if (newOpts.noise !== undefined) material.uniforms.uNoise.value = newOpts.noise;
      if (newOpts.iterations !== undefined) material.uniforms.uIterations.value = newOpts.iterations;
      if (newOpts.intensity !== undefined) material.uniforms.uIntensity.value = newOpts.intensity;
      if (newOpts.bandWidth !== undefined) material.uniforms.uBandWidth.value = newOpts.bandWidth;

      if (newOpts.colors) {
        const arr = newOpts.colors.filter(Boolean).slice(0, MAX_COLORS).map(toVec3);
        for (let i = 0; i < MAX_COLORS; i++) {
          if (i < arr.length) material.uniforms.uColors.value[i].copy(arr[i]);
          else material.uniforms.uColors.value[i].set(0, 0, 0);
        }
        material.uniforms.uColorCount.value = arr.length;
      }

      if (newOpts.transparent !== undefined) {
        material.uniforms.uTransparent.value = newOpts.transparent ? 1 : 0;
        renderer.setClearColor(0x000000, newOpts.transparent ? 0 : 1);
      }
    },
  };
}
