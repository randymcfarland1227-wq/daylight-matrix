import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { RegionId } from "@/lib/daylight/muscles";
import { FIG_SKIN } from "@/lib/daylight/figureColors";
import { ALL_ZONES, nd } from "@/lib/daylight/turnZones";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export type TurnView = "front" | "back" | "left" | "right";
const AZIMUTH: Record<TurnView, number> = { front: 0, right: Math.PI / 2, back: Math.PI, left: -Math.PI / 2 };

export type TurnFigureProps = {
  fill: (id: RegionId) => string;
  under?: (id: RegionId) => boolean;
  selected?: string | null;
  /** region id -> number of notes pinned there */
  pins?: Record<string, number>;
  view: TurnView;
  onSelect: (id: RegionId) => void;
  className?: string;
};

export function TurnFigure({ fill, under, selected, pins, view, onSelect, className }: TurnFigureProps) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ recolor: () => void; pins: () => void; look: (v: TurnView) => void } | null>(null);
  const latest = useRef({ fill, under, selected, pins, view, onSelect });
  latest.current = { fill, under, selected, pins, view, onSelect };

  useEffect(() => {
    const root = host.current;
    if (!root) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 20);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:none";
    renderer.domElement.setAttribute("data-testid", "turn-canvas");
    root.appendChild(renderer.domElement);

    const target = new THREE.Vector3(0, 0.96, 0);
    const R = 4.7;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 1.8;
    controls.maxDistance = 6.5;
    controls.minPolarAngle = 0.7;
    controls.maxPolarAngle = Math.PI - 0.7;
    const look = (v: TurnView) => {
      const a = AZIMUTH[v];
      camera.position.set(Math.sin(a) * R, 0.98, Math.cos(a) * R);
      controls.target.copy(target);
      controls.update();
    };
    look(latest.current.view);

    scene.add(new THREE.HemisphereLight("#f2f7fb", "#8d98a6", 1.1));
    const key = new THREE.DirectionalLight("#ffffff", 1.9);
    key.position.set(1.6, 3, 2.6);
    scene.add(key);
    const back = new THREE.DirectionalLight("#dfe9f5", 1.2);
    back.position.set(-1.6, 2.4, -2.8);
    scene.add(back);
    const fillLight = new THREE.DirectionalLight("#cfe0f0", 0.6);
    fillLight.position.set(-2.4, 1.2, 1.4);
    scene.add(fillLight);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(0.62, 48), new THREE.MeshBasicMaterial({ color: "#8190a3", transparent: true, opacity: 0.22 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.002;
    scene.add(floor);

    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0, flatShading: false });
    let body: THREE.Mesh | null = null;
    let owner: Int16Array | null = null;
    let edge: Float32Array | null = null;
    const pinGroup = new THREE.Group();
    scene.add(pinGroup);
    const skin = new THREE.Color(FIG_SKIN);
    const tmp = new THREE.Color();

    const recolor = () => {
      if (!body || !owner || !edge) return;
      const col = body.geometry.getAttribute("color") as THREE.BufferAttribute;
      const cache = new Map<string, THREE.Color>();
      const sel = latest.current.selected;
      for (let i = 0; i < col.count; i += 1) {
        const o = owner[i]!;
        if (o < 0) {
          col.setXYZ(i, skin.r, skin.g, skin.b);
          continue;
        }
        const id = ALL_ZONES[o]!.id;
        let c = cache.get(id);
        if (!c) {
          c = new THREE.Color(latest.current.fill(id));
          if (latest.current.under?.(id)) c = c.clone().lerp(skin, 0.35);
          if (sel === id) c = c.clone().lerp(new THREE.Color("#ffffff"), 0.28);
          cache.set(id, c);
        }
        tmp.copy(skin).lerp(c, edge[i]!);
        col.setXYZ(i, tmp.r, tmp.g, tmp.b);
      }
      col.needsUpdate = true;
    };

    const drawPins = () => {
      while (pinGroup.children.length) {
        const ch = pinGroup.children.pop() as THREE.Mesh;
        ch.geometry.dispose();
        (ch.material as THREE.Material).dispose();
      }
      const p = latest.current.pins ?? {};
      for (const [id, n] of Object.entries(p)) {
        if (!n) continue;
        for (const z of ALL_ZONES) {
          if (z.id !== id || z.p[0] < 0) continue; // one pin per side-less zone, right-hand copy only
          for (const side of z.p[0] === 0 ? [1] : [1, -1]) {
            const sign = z.p[2] >= 0 ? 1 : -1;
            const m = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
            m.position.set(z.p[0] * side, z.p[1], z.p[2] + sign * z.s[2] * 0.9);
            const ring = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), new THREE.MeshBasicMaterial({ color: "#1b2733", transparent: true, opacity: 0.55 }));
            m.add(ring);
            pinGroup.add(m);
          }
        }
      }
    };

    const loader = new OBJLoader();
    let alive = true;
    loader.load(`${import.meta.env.BASE_URL}human-man.obj?v=2`, (obj) => {
      if (!alive) return;
      obj.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const geo = child.geometry as THREE.BufferGeometry;
        geo.computeVertexNormals();
        const pos = geo.getAttribute("position");
        owner = new Int16Array(pos.count).fill(-1);
        edge = new Float32Array(pos.count);
        for (let i = 0; i < pos.count; i += 1) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);
          let best = -1;
          let bd = 9;
          for (let k = 0; k < ALL_ZONES.length; k += 1) {
            const d = nd(ALL_ZONES[k]!, x, y, z);
            if (d < bd) {
              bd = d;
              best = k;
            }
          }
          if (best >= 0 && bd < 1.18) {
            owner[i] = best;
            edge[i] = 1 - smooth(0.82, 1.18, bd);
          }
        }
        geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3));
        child.material = mat;
        body = child;
      });
      scene.add(obj);
      recolor();
      drawPins();
    });

    const pointer = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    let downAt = { x: 0, y: 0 };
    const down = (e: PointerEvent) => (downAt = { x: e.clientX, y: e.clientY });
    const up = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6 || !body) return; // a drag turns the figure
      const r = renderer.domElement.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObject(body, false)[0];
      if (!hit) return;
      let best: RegionId | null = null;
      let bd = 1.35;
      for (const z of ALL_ZONES) {
        const d = nd(z, hit.point.x, hit.point.y, hit.point.z);
        if (d < bd) {
          bd = d;
          best = z.id;
        }
      }
      if (best) latest.current.onSelect(best);
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", up);

    const resize = () => {
      const w = root.clientWidth || 320;
      const h = root.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();
    api.current = { recolor, pins: drawPins, look };

    return () => {
      alive = false;
      api.current = null;
      cancelAnimationFrame(frame);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointerup", up);
      controls.dispose();
      mat.dispose();
      renderer.dispose();
      root.removeChild(renderer.domElement);
    };
  }, []);

  // cheap updates, keyed by what actually changed
  const sig = `${selected ?? ""}|${JSON.stringify(pins ?? {})}`;
  useEffect(() => {
    api.current?.recolor();
    api.current?.pins();
  }, [sig, fill, under]);
  useEffect(() => {
    api.current?.look(view);
  }, [view]);

  return <div ref={host} className={className} data-testid="turn-figure" />;
}
