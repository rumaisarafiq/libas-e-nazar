import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Genuine interactive 3D — loads a real .glb, lets the person orbit/zoom
// it with their mouse, and recolors actual mesh materials (not a video
// filter approximation). Only usable where a real combo model exists
// (see src/data/glbModels.js); everything else still uses the
// video-based approximation in threeDVideos.js.
//
// Mesh-matching heuristic: since we haven't been able to open the actual
// .glb file yet, this guesses which mesh is the top vs. the bottom by
// checking each mesh/material's own `name` for common keywords (shirt,
// polo, top, upper / pant, trouser, bottom, lower). If the real file uses
// different naming, adjust TOP_NAME_HINTS / BOTTOM_NAME_HINTS below to
// match — that's a one-line fix once someone can see the real names
// (e.g. log `child.name` once in the traverse loop to check).
const TOP_NAME_HINTS = ["shirt", "polo", "top", "upper"];
const BOTTOM_NAME_HINTS = ["pant", "trouser", "bottom", "lower"];

export default function GLBViewer({ src, topColor, bottomColor, className = "" }) {
  const mountRef = useRef(null);
  const meshRefs = useRef({ top: [], bottom: [], unmatched: [] });
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"

  // Load the model once per src
  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    setStatus("loading");
    meshRefs.current = { top: [], bottom: [], unmatched: [] };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 1.4, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 4, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.6);
    fill.position.set(-3, 1, -2);
    scene.add(fill);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 8;
    controls.target.set(0, 1, 0);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    const loader = new GLTFLoader();
    let disposed = false;

    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        // Center and frame the model regardless of its original scale/origin
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        model.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.2 / maxDim;
        model.scale.setScalar(scale);
        controls.target.set(0, size.y * scale * 0.15, 0);

        model.traverse((child) => {
          if (!child.isMesh) return;
          child.material = child.material.clone();
          const label = `${child.name} ${child.material.name || ""}`.toLowerCase();
          if (TOP_NAME_HINTS.some((h) => label.includes(h))) {
            meshRefs.current.top.push(child);
          } else if (BOTTOM_NAME_HINTS.some((h) => label.includes(h))) {
            meshRefs.current.bottom.push(child);
          } else {
            meshRefs.current.unmatched.push(child);
          }
        });

        applyColors();
        scene.add(model);
        setStatus("ready");
        animate();
      },
      undefined,
      (err) => {
        console.error("Failed to load GLB:", src, err);
        if (!disposed) setStatus("error");
      },
    );

    function applyColors() {
      if (topColor) {
        meshRefs.current.top.forEach((m) => m.material.color.set(topColor));
      }
      if (bottomColor) {
        meshRefs.current.bottom.forEach((m) => m.material.color.set(bottomColor));
      }
      // Unmatched meshes are left at their original material color —
      // safer than guessing wrong once we can't verify mesh names yet.
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          child.material?.dispose?.();
        }
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Recolor without reloading the model when just the colors change
  useEffect(() => {
    meshRefs.current.top.forEach((m) => topColor && m.material.color.set(topColor));
    meshRefs.current.bottom.forEach((m) => bottomColor && m.material.color.set(bottomColor));
  }, [topColor, bottomColor]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mountRef} className="h-full w-full" />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 px-4 text-center">
          <p className="text-xs text-white/80">
            Couldn't load the 3D model. Check the file is actually at{" "}
            <code className="text-white">{src}</code>.
          </p>
        </div>
      )}
    </div>
  );
}
