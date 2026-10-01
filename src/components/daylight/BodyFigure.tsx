import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { regionById } from "@/lib/daylight/body";

/** Centers on the posed 6'4" reference mesh, in meters. Front is +Z. */
const MARKS: { id: string; p: [number, number, number]; s: [number, number, number] }[] = [
  { id: "chest", p: [0, 1.38, 0.1], s: [0.18, 0.1, 0.06] },
  { id: "shoulder-front-left", p: [-0.2, 1.52, 0.04], s: [0.08, 0.07, 0.07] },
  { id: "shoulder-front-right", p: [0.2, 1.52, 0.04], s: [0.08, 0.07, 0.07] },
  { id: "biceps-left", p: [-0.28, 1.28, 0.02], s: [0.06, 0.12, 0.06] },
  { id: "biceps-right", p: [0.28, 1.28, 0.02], s: [0.06, 0.12, 0.06] },
  { id: "abs", p: [0, 1.16, 0.09], s: [0.1, 0.12, 0.05] },
  { id: "oblique-left", p: [-0.12, 1.14, 0.07], s: [0.05, 0.1, 0.05] },
  { id: "oblique-right", p: [0.12, 1.14, 0.07], s: [0.05, 0.1, 0.05] },
  { id: "quad-left", p: [-0.1, 0.74, 0.06], s: [0.08, 0.16, 0.07] },
  { id: "quad-right", p: [0.1, 0.74, 0.06], s: [0.08, 0.16, 0.07] },
  { id: "calf-front-left", p: [-0.08, 0.32, 0.05], s: [0.05, 0.12, 0.05] },
  { id: "calf-front-right", p: [0.08, 0.32, 0.05], s: [0.05, 0.12, 0.05] },
  { id: "traps", p: [0, 1.5, -0.04], s: [0.14, 0.08, 0.05] },
  { id: "rear-delt-left", p: [-0.2, 1.5, -0.04], s: [0.07, 0.07, 0.06] },
  { id: "rear-delt-right", p: [0.2, 1.5, -0.04], s: [0.07, 0.07, 0.06] },
  { id: "lat-left", p: [-0.15, 1.24, -0.06], s: [0.08, 0.14, 0.05] },
  { id: "lat-right", p: [0.15, 1.24, -0.06], s: [0.08, 0.14, 0.05] },
  { id: "lower-back", p: [0, 1.08, -0.07], s: [0.1, 0.1, 0.05] },
  { id: "glute-left", p: [-0.08, 0.96, -0.06], s: [0.08, 0.08, 0.06] },
  { id: "glute-right", p: [0.08, 0.96, -0.06], s: [0.08, 0.08, 0.06] },
  { id: "ham-left", p: [-0.09, 0.7, -0.05], s: [0.07, 0.14, 0.06] },
  { id: "ham-right", p: [0.09, 0.7, -0.05], s: [0.07, 0.14, 0.06] },
  { id: "calf-left", p: [-0.07, 0.3, -0.04], s: [0.05, 0.12, 0.05] },
  { id: "calf-right", p: [0.07, 0.3, -0.04], s: [0.05, 0.12, 0.05] },
];

function skinTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#c4896e";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i += 1) {
    const shade = 90 + Math.floor(Math.random() * 50);
    g.fillStyle = `rgba(${shade}, ${Math.floor(shade * 0.62)}, ${Math.floor(shade * 0.5)}, 0.07)`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 2, 1);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 4;
  return map;
}

export function BodyFigure({
  view = "front",
  selectedId,
  highlighted = [],
  onSelect,
  compact = false,
}: {
  view?: "front" | "back";
  selectedId: string | null;
  highlighted?: string[];
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const marks = useRef<Map<string, THREE.Mesh>>(new Map());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const root = el;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e7eef0");
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 20);
    camera.position.set(0, 0.98, 4.4);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    root.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.95, 0);
    controls.enablePan = false;
    controls.minDistance = 1.4;
    controls.maxDistance = 5;
    controls.minPolarAngle = 0.45;
    controls.maxPolarAngle = Math.PI - 0.45;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight("#f4fbff", "#c8b5a6", 0.85));
    const key = new THREE.DirectionalLight("#fff5ee", 2.1);
    key.position.set(1.4, 3.2, 2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight("#d5e7ef", 0.55);
    fill.position.set(-2.2, 1.6, 1.2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight("#ffffff", 0.7);
    rim.position.set(0.2, 2, -2.4);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(0.7, 48),
      new THREE.MeshStandardMaterial({ color: "#d5e0e4", roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const map = skinTexture();
    const skin = new THREE.MeshPhysicalMaterial({
      color: "#c4896e",
      map,
      roughness: 0.48,
      metalness: 0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.55,
      sheen: 0.35,
      sheenColor: new THREE.Color("#e7b89a"),
    });

    const glow = new THREE.MeshStandardMaterial({
      color: "#14958c",
      transparent: true,
      opacity: 0,
      roughness: 0.4,
      depthWrite: false,
    });

    let body: THREE.Mesh | null = null;
    const loader = new OBJLoader();
    let alive = true;
    loader.load(`${import.meta.env.BASE_URL}human-man.obj?v=2`, (obj) => {
      if (!alive) return;
      obj.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const geo = child.geometry;
        geo.computeVertexNormals();
        const pos = geo.attributes.position;
        const uv = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i += 1) {
          uv[i * 2] = Math.atan2(pos.getX(i), pos.getZ(i)) / (Math.PI * 2) + 0.5;
          uv[i * 2 + 1] = pos.getY(i) / 1.93;
        }
        geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        child.material = skin;
        child.castShadow = true;
        child.receiveShadow = true;
        body = child;
      });
      scene.add(obj);
      for (const mark of MARKS) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), glow.clone());
        mesh.position.set(...mark.p);
        mesh.scale.set(...mark.s);
        mesh.userData.regionId = mark.id;
        mesh.raycast = () => {};
        scene.add(mesh);
        marks.current.set(mark.id, mesh);
      }
      paint();
    });

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    function pick(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (!body) return;
      const hit = raycaster.intersectObject(body, false)[0];
      if (!hit) return;
      let best: string | null = null;
      let bestD = 0.34;
      for (const mark of MARKS) {
        const d = hit.point.distanceTo(new THREE.Vector3(...mark.p));
        if (d < bestD) {
          bestD = d;
          best = mark.id;
        }
      }
      if (best) onSelectRef.current(best);
    }
    renderer.domElement.addEventListener("pointerup", pick);

    function resize() {
      const width = root.clientWidth || 280;
      const height = root.clientHeight || 420;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);

    let frame = 0;
    function loop() {
      frame = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    }
    loop();

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerup", pick);
      controls.dispose();
      skin.dispose();
      map?.dispose();
      glow.dispose();
      marks.current.clear();
      renderer.dispose();
      root.removeChild(renderer.domElement);
      cameraRef.current = null;
      controlsRef.current = null;
    };
    // The canvas is created once. Highlight and camera updates are separate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function paint() {
    for (const [id, mesh] of marks.current) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const on = id === selectedId || highlighted.includes(id);
      mat.opacity = id === selectedId ? 0.5 : on ? 0.28 : 0;
      mat.color.set(id === selectedId ? "#0e8f86" : "#7dcec6");
    }
  }

  useEffect(() => {
    paint();
  });

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const z = view === "front" ? 4.4 : -4.4;
    camera.position.set(0, 0.98, z);
    controls.target.set(0, 0.95, 0);
    controls.update();
  }, [view]);

  const selected = selectedId ? regionById(selectedId) : undefined;

  return (
    <figure className={compact ? "m-0" : "m-0"}>
      <div ref={host} className={compact ? "h-96 w-full overflow-hidden rounded-2xl bg-stage" : "h-[36rem] w-full overflow-hidden rounded-2xl bg-stage"} />
      <figcaption className="mt-2 text-sm text-ink-soft">
        {selected ? selected.name : "Drag to turn. Tap a muscle to attach a note."} Reference male, scaled to 6'4" and about 200 lb. Not a scan of you, and not a medical model.
      </figcaption>
    </figure>
  );
}
